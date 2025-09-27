// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZVASP is Ownable {
    IERC20 public rewardToken; // HBAR wrapper or test ERC-20
    mapping(uint => Survey) public surveys;
    uint public surveyCount;

    struct Survey {
        string title;
        string questions; // JSON string, e.g., {"q1":"Rate this","options":["Good","Bad"]}
        uint rewardAmount; // In wei
        uint responseCount;
        mapping(uint => uint) answerCounts; 
    }

    event SurveyCreated(uint surveyId, string title);
    event ResponseSubmitted(uint surveyId, address user);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken); 
    }

    function createSurvey(string memory _title, string memory _questions, uint _rewardAmount) public onlyOwner {
        surveyCount++;
        Survey storage s = surveys[surveyCount];
        s.title = _title;
        s.questions = _questions;
        s.rewardAmount = _rewardAmount;
        rewardToken.transferFrom(msg.sender, address(this), _rewardAmount * 100); // survey creator transfers funds to the pool
        emit SurveyCreated(surveyCount, _title);
    }

    function submitResponse(uint _surveyId, uint[] memory _answers) public {
        // Placeholder for Self ZK proof verification (simplified for now)
        Survey storage s = surveys[_surveyId];
        require(s.rewardAmount > 0, "Invalid survey");
        s.responseCount++;
        for (uint i = 0; i < _answers.length; i++) {
            s.answerCounts[i] += _answers[i]; // Aggregate answers
        }
        rewardToken.transfer(msg.sender, s.rewardAmount);
        emit ResponseSubmitted(_surveyId, msg.sender);
    }

    // Placeholder for Pyth price feed (to be updated with actual integration)
    function getFiatRewardValue(uint _surveyId) public view returns (uint) {
        return surveys[_surveyId].rewardAmount; // Mock; replace with Pyth call
    }
}