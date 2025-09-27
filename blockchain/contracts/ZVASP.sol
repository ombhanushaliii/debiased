// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZVASP is Ownable, ReentrancyGuard {
    // Commission settings - 2% fee with 500 KDA maximum
    uint256 public constant COMMISSION_RATE = 200; // 2% = 200 basis points
    uint256 public constant MAX_COMMISSION = 500 * 10 ** 18; // 500 KDA max
    uint256 public constant BASIS_POINTS = 10000;

    address public treasuryAddress;
    address public relayServer; // Authorized relay server address

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
        uint256 totalFunding; // Total amount allocated by creator
        uint256 rewardPerResponse; // Amount per individual response
        uint256 commission; // Commission taken by platform
        uint256 availableFunding; // Remaining funds for responses
        uint256 responseCount;
        uint256 maxResponses;
        bool isActive;
        uint256 createdAt;
        mapping(uint => mapping(uint => uint)) answerCounts; // questionIndex => optionIndex => count
        mapping(uint => string[]) subjectiveResponses; // questionIndex => text answers
        mapping(address => bool) hasResponded;
    }

    struct SurveyView {
        string title;
        string description;
        address creator;
        uint256 totalFunding;
        uint256 rewardPerResponse;
        uint256 commission;
        uint256 availableFunding;
        uint256 responseCount;
        uint256 maxResponses;
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Survey) public surveys;
    mapping(address => bool) public verifiedUsers; // Users verified through relay
    mapping(address => uint256[]) public userSurveys;
    mapping(address => uint256) public userEarnings;

    uint256 public surveyCount;
    uint256 public totalCommissionEarned;

    event SurveyCreated(
        uint256 indexed surveyId,
        address indexed creator,
        string title,
        uint256 totalFunding,
        uint256 rewardPerResponse,
        uint256 commission,
        uint256 maxResponses
    );

    event ResponseSubmitted(
        uint256 indexed surveyId,
        address indexed respondent
    );
    event RewardPaid(
        uint256 indexed surveyId,
        address indexed respondent,
        uint256 amount
    );
    event UserVerifiedByRelay(address indexed user, uint256 timestamp);
    event SurveyFunded(uint256 indexed surveyId, uint256 amount);
    event FundsWithdrawn(
        uint256 indexed surveyId,
        address indexed creator,
        uint256 amount
    );
    event SurveyDeactivated(uint256 indexed surveyId);

    modifier onlyRelay() {
        require(msg.sender == relayServer, "Only relay server can call this");
        _;
    }

    modifier validSurvey(uint256 _surveyId) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        require(surveys[_surveyId].isActive, "Survey not active");
        _;
    }

    constructor(
        address _treasuryAddress,
        address _relayServer
    ) Ownable(msg.sender) {
        treasuryAddress = _treasuryAddress;
        relayServer = _relayServer;
    }

    // Relay server calls this when user verifies on Celo
    function markUserVerified(address user) external onlyRelay {
        verifiedUsers[user] = true;
        emit UserVerifiedByRelay(user, block.timestamp);
    }

    // Batch verify multiple users (gas optimization for relay)
    function batchMarkUsersVerified(
        address[] calldata users
    ) external onlyRelay {
        for (uint i = 0; i < users.length; i++) {
            verifiedUsers[users[i]] = true;
            emit UserVerifiedByRelay(users[i], block.timestamp);
        }
    }

    // Calculate commission based on total funding
    function calculateCommission(
        uint256 totalFunding
    ) public pure returns (uint256) {
        uint256 commission = (totalFunding * COMMISSION_RATE) / BASIS_POINTS;
        return commission > MAX_COMMISSION ? MAX_COMMISSION : commission;
    }

    // Calculate funding details when creator enters total amount
    function calculateFromTotalFunding(
        uint256 totalFunding,
        uint256 maxResponses
    )
        public
        pure
        returns (
            uint256 commission,
            uint256 availableForRewards,
            uint256 rewardPerResponse
        )
    {
        require(totalFunding > 0 && maxResponses > 0, "Invalid parameters");

        commission = calculateCommission(totalFunding);
        availableForRewards = totalFunding - commission;
        rewardPerResponse = availableForRewards / maxResponses;

        require(rewardPerResponse > 0, "Insufficient funding for rewards");
    }

    // Calculate funding details when creator enters individual amount
    function calculateFromIndividualAmount(
        uint256 rewardPerResponse,
        uint256 maxResponses
    ) public pure returns (uint256 commission, uint256 totalFunding) {
        require(
            rewardPerResponse > 0 && maxResponses > 0,
            "Invalid parameters"
        );

        uint256 totalRewards = rewardPerResponse * maxResponses;

        // Calculate total needed including commission
        // If totalRewards + commission = total, and commission = 2% of total
        // Then totalRewards = 98% of total, so total = totalRewards / 0.98
        uint256 totalNeeded = (totalRewards * BASIS_POINTS) /
            (BASIS_POINTS - COMMISSION_RATE);
        commission = calculateCommission(totalNeeded);

        // Adjust if commission hits the cap
        if (commission == MAX_COMMISSION) {
            totalFunding = totalRewards + MAX_COMMISSION;
        } else {
            totalFunding = totalNeeded;
        }
    }

    // Create survey by specifying total funding
    function createSurveyWithTotalFunding(
        string memory _title,
        string memory _description,
        Question[] memory _questions,
        uint256 totalFunding,
        uint256 maxResponses
    ) external payable nonReentrant {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_questions.length > 0, "At least one question required");
        require(_questions.length <= 20, "Too many questions (max 20)");

        (
            uint256 commission,
            uint256 availableForRewards,
            uint256 rewardPerResponse
        ) = calculateFromTotalFunding(totalFunding, maxResponses);

        require(msg.value >= totalFunding, "Insufficient payment");

        _createSurvey(
            _title,
            _description,
            _questions,
            totalFunding,
            rewardPerResponse,
            commission,
            availableForRewards,
            maxResponses
        );

        // Refund excess payment
        if (msg.value > totalFunding) {
            payable(msg.sender).transfer(msg.value - totalFunding);
        }
    }

    // Create survey by specifying individual reward amount
    function createSurveyWithIndividualAmount(
        string memory _title,
        string memory _description,
        Question[] memory _questions,
        uint256 rewardPerResponse,
        uint256 maxResponses
    ) external payable nonReentrant {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_questions.length > 0, "At least one question required");
        require(_questions.length <= 20, "Too many questions (max 20)");

        (
            uint256 commission,
            uint256 totalFunding
        ) = calculateFromIndividualAmount(rewardPerResponse, maxResponses);

        require(msg.value >= totalFunding, "Insufficient payment");

        uint256 availableForRewards = totalFunding - commission;

        _createSurvey(
            _title,
            _description,
            _questions,
            totalFunding,
            rewardPerResponse,
            commission,
            availableForRewards,
            maxResponses
        );

        // Refund excess payment
        if (msg.value > totalFunding) {
            payable(msg.sender).transfer(msg.value - totalFunding);
        }
    }

    function _createSurvey(
        string memory _title,
        string memory _description,
        Question[] memory _questions,
        uint256 totalFunding,
        uint256 rewardPerResponse,
        uint256 commission,
        uint256 availableForRewards,
        uint256 maxResponses
    ) internal {
        // Validate question types
        for (uint i = 0; i < _questions.length; i++) {
            require(
                _isValidQuestionType(_questions[i].questionType),
                "Invalid question type"
            );
        }

        surveyCount++;
        Survey storage s = surveys[surveyCount];
        s.title = _title;
        s.description = _description;
        s.creator = msg.sender;
        s.totalFunding = totalFunding;
        s.rewardPerResponse = rewardPerResponse;
        s.commission = commission;
        s.availableFunding = availableForRewards;
        s.maxResponses = maxResponses;
        s.isActive = true;
        s.createdAt = block.timestamp;

        // Copy questions
        for (uint i = 0; i < _questions.length; i++) {
            s.questions.push(_questions[i]);
        }

        userSurveys[msg.sender].push(surveyCount);
        totalCommissionEarned += commission;

        // Transfer commission to treasury
        payable(treasuryAddress).transfer(commission);

        emit SurveyCreated(
            surveyCount,
            msg.sender,
            _title,
            totalFunding,
            rewardPerResponse,
            commission,
            maxResponses
        );
        emit SurveyFunded(surveyCount, totalFunding);
    }

    // Submit survey response (only verified users)
    function submitResponse(
        uint256 _surveyId,
        uint256[] memory _mcqAnswers,
        string[] memory _subjectiveAnswers
    ) external nonReentrant validSurvey(_surveyId) {
        require(
            !surveys[_surveyId].hasResponded[msg.sender],
            "Already responded to this survey"
        );
        require(verifiedUsers[msg.sender], "User not verified via relay");

        Survey storage s = surveys[_surveyId];

        // Check max responses limit
        require(
            s.responseCount < s.maxResponses,
            "Survey response limit reached"
        );
        require(
            s.availableFunding >= s.rewardPerResponse,
            "Insufficient funds in survey pool"
        );

        // Validate answer counts
        uint256 expectedMCQCount = 0;
        uint256 expectedSubjectiveCount = 0;

        for (uint i = 0; i < s.questions.length; i++) {
            if (_isMCQOrRating(s.questions[i].questionType)) {
                expectedMCQCount++;
            } else if (_isSubjective(s.questions[i].questionType)) {
                expectedSubjectiveCount++;
            }
        }

        require(
            _mcqAnswers.length == expectedMCQCount,
            "MCQ answer count mismatch"
        );
        require(
            _subjectiveAnswers.length == expectedSubjectiveCount,
            "Subjective answer count mismatch"
        );

        // Process answers
        uint256 mcqIndex = 0;
        uint256 subjectiveIndex = 0;

        for (uint i = 0; i < s.questions.length; i++) {
            if (_isMCQOrRating(s.questions[i].questionType)) {
                uint256 answer = _mcqAnswers[mcqIndex];

                if (s.questions[i].isRequired) {
                    require(answer > 0, "Required MCQ answer cannot be empty");
                }

                if (answer > 0) {
                    require(
                        answer <= s.questions[i].options.length,
                        "Invalid MCQ option"
                    );
                    s.answerCounts[i][answer - 1]++; // Convert to 0-based index
                }
                mcqIndex++;
            } else if (_isSubjective(s.questions[i].questionType)) {
                string memory response = _subjectiveAnswers[subjectiveIndex];

                if (s.questions[i].isRequired) {
                    require(
                        bytes(response).length > 0,
                        "Required subjective answer cannot be empty"
                    );
                }

                if (bytes(response).length > 0) {
                    // For gas efficiency, store hash for very long responses
                    if (bytes(response).length > 500) {
                        s.subjectiveResponses[i].push(
                            string(
                                abi.encodePacked(
                                    "HASH:",
                                    _toHexString(keccak256(bytes(response)))
                                )
                            )
                        );
                    } else {
                        s.subjectiveResponses[i].push(response);
                    }
                }
                subjectiveIndex++;
            }
        }

        // Mark as responded and update counts
        s.hasResponded[msg.sender] = true;
        s.responseCount++;
        s.availableFunding -= s.rewardPerResponse;

        userEarnings[msg.sender] += s.rewardPerResponse;

        // Send reward to respondent
        payable(msg.sender).transfer(s.rewardPerResponse);

        emit ResponseSubmitted(_surveyId, msg.sender);
        emit RewardPaid(_surveyId, msg.sender, s.rewardPerResponse);

        // Close survey if max responses reached
        if (s.responseCount >= s.maxResponses) {
            s.isActive = false;
            emit SurveyDeactivated(_surveyId);
        }
    }

    // View functions
    function getSurvey(
        uint256 _surveyId
    ) external view returns (SurveyView memory) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        Survey storage s = surveys[_surveyId];

        return
            SurveyView({
                title: s.title,
                description: s.description,
                creator: s.creator,
                totalFunding: s.totalFunding,
                rewardPerResponse: s.rewardPerResponse,
                commission: s.commission,
                availableFunding: s.availableFunding,
                responseCount: s.responseCount,
                maxResponses: s.maxResponses,
                isActive: s.isActive,
                createdAt: s.createdAt
            });
    }

    function getQuestions(
        uint256 _surveyId
    ) external view returns (Question[] memory) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        return surveys[_surveyId].questions;
    }

    function getAnswerCounts(
        uint256 _surveyId,
        uint256 _questionIndex
    ) external view returns (uint256[] memory) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        Survey storage s = surveys[_surveyId];
        require(_questionIndex < s.questions.length, "Invalid question index");

        uint256[] memory counts = new uint256[](
            s.questions[_questionIndex].options.length
        );
        for (uint i = 0; i < s.questions[_questionIndex].options.length; i++) {
            counts[i] = s.answerCounts[_questionIndex][i];
        }
        return counts;
    }

    function getSubjectiveResponses(
        uint256 _surveyId,
        uint256 _questionIndex
    ) external view returns (string[] memory) {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        return surveys[_surveyId].subjectiveResponses[_questionIndex];
    }

    // Creator functions
    function deactivateSurvey(uint256 _surveyId) external {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        Survey storage s = surveys[_surveyId];
        require(s.creator == msg.sender, "Not survey creator");
        require(s.isActive, "Survey already inactive");

        s.isActive = false;
        emit SurveyDeactivated(_surveyId);
    }

    function withdrawUnusedFunds(uint256 _surveyId) external nonReentrant {
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey ID");
        Survey storage s = surveys[_surveyId];
        require(s.creator == msg.sender, "Not survey creator");
        require(!s.isActive, "Survey still active");
        require(s.availableFunding > 0, "No funds to withdraw");

        uint256 amount = s.availableFunding;
        s.availableFunding = 0;

        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(_surveyId, msg.sender, amount);
    }

    // Admin functions
    function updateRelayServer(address _newRelay) external onlyOwner {
        relayServer = _newRelay;
    }

    function updateTreasuryAddress(address _newTreasury) external onlyOwner {
        treasuryAddress = _newTreasury;
    }

    // Get user's surveys
    function getUserSurveys(
        address user
    ) external view returns (uint256[] memory) {
        return userSurveys[user];
    }

    // Emergency withdrawal (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Helper functions
    function _isValidQuestionType(
        string memory _type
    ) internal pure returns (bool) {
        return (keccak256(bytes(_type)) == keccak256(bytes("MCQ")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Subjective")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Rating")));
    }

    function _isMCQOrRating(string memory _type) internal pure returns (bool) {
        return (keccak256(bytes(_type)) == keccak256(bytes("MCQ")) ||
            keccak256(bytes(_type)) == keccak256(bytes("Rating")));
    }

    function _isSubjective(string memory _type) internal pure returns (bool) {
        return keccak256(bytes(_type)) == keccak256(bytes("Subjective"));
    }

    function _toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i * 2] = alphabet[uint8(value[i] >> 4)];
            str[1 + i * 2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }
}
