// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProgrammingChallengePlatform {
    // Struct to represent a milestone
    struct Milestone {
        uint256 unlockTimestamp; // When the milestone unlocks
        bool completed;          // Whether it has been won
        address winner;          // Address of the winner
    }

    // Struct to represent a challenge
    struct Challenge {
        address creator;               // Creator of the challenge (admin)
        uint256 totalStake;            // Total stake amount in wei
        uint256 totalPlayers;          // Number of participants
        address[] allowedParticipants; // List of allowed participant addresses
        uint256 stakePerPlayer;        // Stake amount per player (totalStake / totalPlayers)
        uint256 joinedCount;           // Number of participants who have joined
        Milestone[] milestones;        // Array of milestones
        uint256 balance;               // Current balance of the challenge
        uint256 rewardPerMilestone;    // Reward amount per milestone
    }

    // Array of all challenges
    Challenge[] public challenges;

    // Mapping to track which participants have joined each challenge
    mapping(uint256 => mapping(address => bool)) public hasJoined;

    // Events for logging actions
    event ChallengeCreated(uint256 challengeId, address creator);
    event ParticipantJoined(uint256 challengeId, address participant);
    event MilestoneWon(uint256 challengeId, uint256 milestoneIndex, address winner);
    event RemainingBalanceWithdrawn(uint256 challengeId, uint256 amount);

    // Create a new challenge
    function createChallenge(
        uint256 _totalStake,
        uint256 _totalPlayers,
        address[] calldata _allowedParticipants,
        uint256[] calldata _milestoneTimestamps
    ) external {
        require(_totalPlayers > 0, "Must have players");
        require(_allowedParticipants.length == _totalPlayers, "Mismatch in players");
        require(_milestoneTimestamps.length > 0, "Must have milestones");

        uint256 stakePerPlayer = _totalStake / _totalPlayers;
        uint256 rewardPerMilestone = _totalStake / _milestoneTimestamps.length;

        // Create the new challenge
        Challenge storage newChallenge = challenges.push();
        newChallenge.creator = msg.sender;
        newChallenge.totalStake = _totalStake;
        newChallenge.totalPlayers = _totalPlayers;
        newChallenge.allowedParticipants = _allowedParticipants;
        newChallenge.stakePerPlayer = stakePerPlayer;
        newChallenge.joinedCount = 0;
        newChallenge.balance = 0;
        newChallenge.rewardPerMilestone = rewardPerMilestone;

        // Initialize milestones
        for (uint256 i = 0; i < _milestoneTimestamps.length; i++) {
            newChallenge.milestones.push(
                Milestone({
                    unlockTimestamp: _milestoneTimestamps[i],
                    completed: false,
                    winner: address(0)
                })
            );
        }

        uint256 challengeId = challenges.length - 1;
        emit ChallengeCreated(challengeId, msg.sender);
    }

    // Allow a participant to join a challenge by staking
    function joinChallenge(uint256 _challengeId) external payable {
        Challenge storage challenge = challenges[_challengeId];

        // Check if the sender is an allowed participant
        bool isAllowed = false;
        for (uint256 i = 0; i < challenge.allowedParticipants.length; i++) {
            if (challenge.allowedParticipants[i] == msg.sender) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Not an allowed participant");
        require(!hasJoined[_challengeId][msg.sender], "Already joined");
        require(msg.value == challenge.stakePerPlayer, "Incorrect stake amount");

        // Update state
        hasJoined[_challengeId][msg.sender] = true;
        challenge.joinedCount += 1;
        challenge.balance += msg.value;

        emit ParticipantJoined(_challengeId, msg.sender);
    }

    // Set the winner for a milestone
    function setMilestoneWinner(
        uint256 _challengeId,
        uint256 _milestoneIndex,
        address _winner
    ) external {
        Challenge storage challenge = challenges[_challengeId];
        require(msg.sender == challenge.creator, "Only creator can set winner");
        require(challenge.joinedCount == challenge.totalPlayers, "Not all players joined");
        require(_milestoneIndex < challenge.milestones.length, "Invalid milestone index");

        Milestone storage milestone = challenge.milestones[_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        require(block.timestamp >= milestone.unlockTimestamp, "Milestone not unlocked");
        require(hasJoined[_challengeId][_winner], "Winner not joined");

        // Update milestone
        milestone.winner = _winner;
        milestone.completed = true;

        // Distribute reward
        uint256 reward = challenge.rewardPerMilestone;
        require(challenge.balance >= reward, "Insufficient balance");
        challenge.balance -= reward;

        (bool success, ) = _winner.call{value: reward}("");
        require(success, "Reward transfer failed");

        emit MilestoneWon(_challengeId, _milestoneIndex, _winner);
    }

    // Allow creator to withdraw remaining balance after all milestones are completed
    function withdrawRemainingBalance(uint256 _challengeId) external {
        Challenge storage challenge = challenges[_challengeId];
        require(msg.sender == challenge.creator, "Only creator can withdraw");

        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint256 i = 0; i < challenge.milestones.length; i++) {
            if (!challenge.milestones[i].completed) {
                allCompleted = false;
                break;
            }
        }
        require(allCompleted, "Not all milestones completed");

        uint256 remaining = challenge.balance;
        require(remaining > 0, "No balance to withdraw");

        challenge.balance = 0;
        (bool success, ) = msg.sender.call{value: remaining}("");
        require(success, "Withdrawal failed");

        emit RemainingBalanceWithdrawn(_challengeId, remaining);
    }

    // Helper function to get challenge details (optional for frontend)
    function getChallenge(uint256 _challengeId)
        external
        view
        returns (
            address creator,
            uint256 totalStake,
            uint256 totalPlayers,
            uint256 joinedCount,
            uint256 balance,
            uint256 milestoneCount
        )
    {
        Challenge storage challenge = challenges[_challengeId];
        return (
            challenge.creator,
            challenge.totalStake,
            challenge.totalPlayers,
            challenge.joinedCount,
            challenge.balance,
            challenge.milestones.length
        );
    }
}