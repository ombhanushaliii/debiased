// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfHuman.sol"; 

interface IProofOfHuman {
    function verifyProof(bytes memory _proof, address _user) external view returns (bool);
    function hasVerifiedProof(address _user) external view returns (bool);
}

contract ZVASP is Ownable {
    uint public surveyCount;
    IProofOfHuman public proofOfHuman;

    struct Question {
        string text; // e.g., "Rate our service"
        string questionType; // "MCQ", "Subjective", "Rating"
        string[] options; // For MCQ/Rating, e.g., ["1", "2", "3", "4", "5"]
        bool isRequired; // Required flag
    }

    struct Survey {
        string title;
        string description;
        address creator;
        Question[] questions;
        uint rewardAmount; 
        uint responseCount;
        uint maxResponses; 
        bool isActive;
        uint createdAt;
        mapping(uint => mapping(uint => uint)) answerCounts; // questionIndex => optionIndex => count
        mapping(uint => string[]) subjectiveResponses; // questionIndex => text answers (or IPFS hashes)
    }

    mapping(uint => Survey) public surveys;
    mapping(uint => mapping(address => bool)) public hasResponded; // Prevent duplicates
    mapping(address => bool) public verifiedUsers; // Track ZK-verified users

    event SurveyCreated(uint indexed surveyId, string title, address indexed creator);
    event ResponseSubmitted(uint indexed surveyId, address indexed respondent);
    event RewardClaimed(uint indexed surveyId, address indexed respondent, uint amount);
    event SurveyDeactivated(uint indexed surveyId);

    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender] || proofOfHuman.hasVerifiedProof(msg.sender), "User not verified");
        _;
    }

    modifier validSurvey(uint _surveyId) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        require(surveys[_surveyId].isActive, "Survey not active");
        _;
    }

    constructor(address _proofOfHuman) Ownable(msg.sender) {
        proofOfHuman = IProofOfHuman(_proofOfHuman);
    }

    function createSurvey(
        string memory _title,
        string memory _description,
        Question[] memory _questions,
        uint _rewardAmount,
        uint _maxResponses
    ) public payable {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_questions.length > 0, "At least one question required");
        require(_questions.length <= 20, "Too many questions (max 20)");
        
        // Calculate required KDA for rewards (rewardAmount * maxResponses or 100 default)
        uint estimatedResponses = _maxResponses > 0 ? _maxResponses : 100;
        require(msg.value >= _rewardAmount * estimatedResponses, "Insufficient KDA for rewards");

        surveyCount++;
        Survey storage s = surveys[surveyCount];
        s.title = _title;
        s.description = _description;
        s.creator = msg.sender;
        s.rewardAmount = _rewardAmount;
        s.maxResponses = _maxResponses;
        s.isActive = true;
        s.createdAt = block.timestamp;

        // Add questions with validation
        for (uint i = 0; i < _questions.length; i++) {
            require(bytes(_questions[i].text).length > 0, "Question text cannot be empty");
            require(_isValidQuestionType(_questions[i].questionType), "Invalid question type");
            
            if (_isMCQOrRating(_questions[i].questionType)) {
                require(_questions[i].options.length >= 2, "MCQ/Rating needs at least 2 options");
                require(_questions[i].options.length <= 10, "Too many options (max 10)");
            }
            
            s.questions.push(_questions[i]);
        }

        emit SurveyCreated(surveyCount, _title, msg.sender);
    }

    function submitResponse(
        uint _surveyId,
        uint[] memory _mcqAnswers,
        string[] memory _subjectiveAnswers,
        bytes memory _zkProof
    ) public onlyVerifiedUser validSurvey(_surveyId) {
        require(!hasResponded[_surveyId][msg.sender], "Already responded to this survey");
        
        // Verify ZK proof if not already verified
        if (!verifiedUsers[msg.sender]) {
            require(proofOfHuman.verifyProof(_zkProof, msg.sender), "Invalid ZK Proof");
            verifiedUsers[msg.sender] = true;
        }

        Survey storage s = surveys[_surveyId];
        
        // Check max responses limit
        if (s.maxResponses > 0) {
            require(s.responseCount < s.maxResponses, "Survey response limit reached");
        }

        // Validate answer counts
        uint expectedMCQCount = 0;
        uint expectedSubjectiveCount = 0;
        
        for (uint i = 0; i < s.questions.length; i++) {
            if (_isMCQOrRating(s.questions[i].questionType)) {
                expectedMCQCount++;
            } else if (_isSubjective(s.questions[i].questionType)) {
                expectedSubjectiveCount++;
            }
        }
        
        require(_mcqAnswers.length == expectedMCQCount, "MCQ answer count mismatch");
        require(_subjectiveAnswers.length == expectedSubjectiveCount, "Subjective answer count mismatch");

        // Process responses
        hasResponded[_surveyId][msg.sender] = true;
        s.responseCount++;

        uint mcqIndex = 0;
        uint subjectiveIndex = 0;
        
        for (uint i = 0; i < s.questions.length; i++) {
            Question storage question = s.questions[i];
            
            if (_isMCQOrRating(question.questionType)) {
                uint answerIndex = _mcqAnswers[mcqIndex];
                
                if (question.isRequired) {
                    require(answerIndex < question.options.length, "Invalid MCQ option");
                }
                
                if (answerIndex < question.options.length) {
                    s.answerCounts[i][answerIndex]++;
                }
                mcqIndex++;
                
            } else if (_isSubjective(question.questionType)) {
                string memory response = _subjectiveAnswers[subjectiveIndex];
                
                if (question.isRequired) {
                    require(bytes(response).length > 0, "Required subjective answer cannot be empty");
                }
                
                if (bytes(response).length > 0) {
                    // For gas efficiency, could store hash for very long responses
                    if (bytes(response).length > 500) {
                        s.subjectiveResponses[i].push(string(abi.encodePacked("HASH:", _toHexString(keccak256(bytes(response))))));
                    } else {
                        s.subjectiveResponses[i].push(response);
                    }
                }
                subjectiveIndex++;
            }
        }

        // Send reward to respondent
        if (s.rewardAmount > 0 && address(this).balance >= s.rewardAmount) {
            payable(msg.sender).transfer(s.rewardAmount);
            emit RewardClaimed(_surveyId, msg.sender, s.rewardAmount);
        }

        emit ResponseSubmitted(_surveyId, msg.sender);
    }

    // View functions
    function getSurvey(uint _surveyId) external view returns (
        string memory title,
        string memory description,
        address creator,
        uint rewardAmount,
        uint responseCount,
        uint maxResponses,
        bool isActive,
        uint createdAt
    ) {
        Survey storage s = surveys[_surveyId];
        return (s.title, s.description, s.creator, s.rewardAmount, s.responseCount, s.maxResponses, s.isActive, s.createdAt);
    }

    function getQuestion(uint _surveyId, uint _questionIndex) external view returns (
        string memory text,
        string memory questionType,
        string[] memory options,
        bool isRequired
    ) {
        Question storage q = surveys[_surveyId].questions[_questionIndex];
        return (q.text, q.questionType, q.options, q.isRequired);
    }

    function getQuestionCount(uint _surveyId) external view returns (uint) {
        return surveys[_surveyId].questions.length;
    }

    function getAnswerCounts(uint _surveyId, uint _questionIndex) external view returns (uint[] memory) {
        Survey storage s = surveys[_surveyId];
        uint optionCount = s.questions[_questionIndex].options.length;
        uint[] memory counts = new uint[](optionCount);
        
        for (uint i = 0; i < optionCount; i++) {
            counts[i] = s.answerCounts[_questionIndex][i];
        }
        return counts;
    }

    function getSubjectiveResponses(uint _surveyId, uint _questionIndex) external view returns (string[] memory) {
        return surveys[_surveyId].subjectiveResponses[_questionIndex];
    }

    // Admin functions
    function deactivateSurvey(uint _surveyId) external {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        require(surveys[_surveyId].creator == msg.sender || owner() == msg.sender, "Not authorized");
        
        surveys[_surveyId].isActive = false;
        emit SurveyDeactivated(_surveyId);
    }

    function withdrawRemaining(uint _surveyId) external {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        Survey storage s = surveys[_surveyId];
        require(s.creator == msg.sender, "Not survey creator");
        require(!s.isActive, "Survey still active");
        
        uint remaining = address(this).balance;
        if (remaining > 0) {
            payable(msg.sender).transfer(remaining);
        }
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function updateProofOfHumanContract(address _newProofOfHuman) external onlyOwner {
        proofOfHuman = IProofOfHuman(_newProofOfHuman);
    }

    // Helper functions
    function _isValidQuestionType(string memory _type) internal pure returns (bool) {
        return (
            keccak256(bytes(_type)) == keccak256(bytes("MCQ")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Subjective")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Rating"))
        );
    }

    function _isMCQOrRating(string memory _type) internal pure returns (bool) {
        return (
            keccak256(bytes(_type)) == keccak256(bytes("MCQ")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Rating"))
        );
    }

    function _isSubjective(string memory _type) internal pure returns (bool) {
        return keccak256(bytes(_type)) == keccak256(bytes("Subjective"));
    }

    function _toHexString(bytes32 _hash) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint(uint8(_hash[i] >> 4))];
            str[1+i*2] = alphabet[uint(uint8(_hash[i] & 0x0f))];
        }
        return string(str);
    }

    // Receive function to accept KDA
    receive() external payable {}
    fallback() external payable {}
}