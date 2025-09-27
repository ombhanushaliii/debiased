// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZVASP is Ownable {
    uint public surveyCount;

    struct Question {
        string text; // e.g., "Rate this"
        string questionType; // "MCQ", "Subjective", "Rating"
        string[] options; // For MCQ/Rating, e.g., ["Good", "Bad"]
        bool isRequired; // Required flag
    }

    struct Survey {
        string title;
        Question[] questions; // Array of questions
        uint rewardAmount; // KDA wei per response
        uint responseCount;
        mapping(uint => mapping(uint => uint)) answerCounts; // questionIndex => optionIndex => count
        mapping(uint => string[]) subjectiveResponses; // questionIndex => text answers (or IPFS hashes)
    }

    mapping(uint => Survey) public surveys;
    mapping(uint => mapping(address => bool)) public hasResponded; // Prevent duplicates

    event SurveyCreated(uint indexed surveyId, string title);
    event ResponseSubmitted(uint indexed surveyId, address respondent);

    constructor() Ownable(msg.sender) {}

    function createSurvey(
        string memory _title,
        Question[] memory _questions,
        uint _rewardAmount
    ) public onlyOwner payable {
        require(_questions.length > 0, "At least one question required");
        require(msg.value >= _rewardAmount * 100, "Insufficient KDA");
        surveyCount++;
        Survey storage s = surveys[surveyCount];
        s.title = _title;
        s.rewardAmount = _rewardAmount;

        // Initialize questions
        for (uint i = 0; i < _questions.length; i++) {
            s.questions.push(_questions[i]);
        }

        emit SurveyCreated(surveyCount, _title);
    }

    function submitResponse(
        uint _surveyId,
        uint[] memory _mcqAnswers, // Indices for MCQ/Rating
        string[] memory _subjectiveAnswers, // Text for subjective (or IPFS hashes)
        bytes memory _zkProof
    ) public {
        require(_zkProof.length > 0, "Mock ZK Proof required");
        require(_surveyId <= surveyCount && _surveyId > 0, "Invalid survey");
        require(!hasResponded[_surveyId][msg.sender], "Already responded");
        Survey storage s = surveys[_surveyId];
        require(_mcqAnswers.length + _subjectiveAnswers.length == s.questions.length, "Answer count mismatch");

        hasResponded[_surveyId][msg.sender] = true;
        s.responseCount++;

        uint mcqIndex = 0;
        uint subjectiveIndex = 0;
        for (uint i = 0; i < s.questions.length; i++) {
            if (keccak256(bytes(s.questions[i].questionType)) == keccak256(bytes("MCQ")) ||
                keccak256(bytes(s.questions[i].questionType)) == keccak256(bytes("Rating"))) {
                require(mcqIndex < _mcqAnswers.length, "MCQ answer missing");
                if (s.questions[i].isRequired) {
                    require(_mcqAnswers[mcqIndex] < s.questions[i].options.length, "Invalid option");
                }
                s.answerCounts[i][_mcqAnswers[mcqIndex]]++;
                mcqIndex++;
            } else if (keccak256(bytes(s.questions[i].questionType)) == keccak256(bytes("Subjective"))) {
                require(subjectiveIndex < _subjectiveAnswers.length, "Subjective answer missing");
                if (s.questions[i].isRequired) {
                    require(bytes(_subjectiveAnswers[subjectiveIndex]).length > 0, "Required answer empty");
                }
                s.subjectiveResponses[i].push(_subjectiveAnswers[subjectiveIndex]);
                subjectiveIndex++;
            }
        }

        payable(msg.sender).transfer(s.rewardAmount);
        emit ResponseSubmitted(_surveyId, msg.sender);
    }

    function getSubjectiveResponses(uint _surveyId, uint _questionIndex) external view returns (string[] memory) {
        return surveys[_surveyId].subjectiveResponses[_questionIndex];
    }
}