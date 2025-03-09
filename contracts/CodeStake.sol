// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CodeStake is Ownable, ReentrancyGuard, Pausable {
    // Structs
    struct Challenge {
        string name;
        string track;
        address creator;
        uint256 startDate;
        uint256 endDate;
        uint256 stakedAmount;
        uint256 totalStake;
        address[] participants;
        bool isActive;
        Milestone[] milestones;
    }

    struct Milestone {
        string name;
        uint256 unlockDate;
        uint256 reward;
        bool isUnlocked;
        bool isCompleted;
        CompletionInfo firstCompletedBy;
    }

    struct CompletionInfo {
        address user;
        uint256 timestamp;
    }

    struct Transaction {
        string id;
        string txType; // "earned", "staked", "deposited", "withdrawn"
        uint256 amount;
        uint256 timestamp;
        string description;
        string challenge;
    }

    struct WalletSummary {
        uint256 balance;
        uint256 totalEarned;
        uint256 totalStaked;
    }

    // Events
    event ChallengeCreated(uint256 indexed challengeId, string name, address creator);
    event MilestoneCompleted(uint256 indexed challengeId, uint256 milestoneIndex, address completer);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    // State variables
    mapping(uint256 => Challenge) public challenges;
    mapping(address => WalletSummary) public walletSummaries;
    mapping(address => Transaction[]) public userTransactions;
    uint256 public challengeCounter;
    uint256 public platformFee = 50; // 0.5% in basis points (100 = 1%)

    // Constructor
    constructor() Ownable(msg.sender) {}

    // Modifiers
    modifier validChallenge(uint256 challengeId) {
        require(challengeId < challengeCounter, "Invalid challenge ID");
        _;
    }

    modifier onlyParticipant(uint256 challengeId) {
        bool isParticipant = false;
        for (uint i = 0; i < challenges[challengeId].participants.length; i++) {
            if (challenges[challengeId].participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Not a participant");
        _;
    }

    // Main functions
    function createChallenge(
        string memory name,
        string memory track,
        uint256 duration,
        address[] memory participants,
        string[] memory milestoneNames,
        uint256[] memory milestoneRewards
    ) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Stake required");
        require(participants.length > 0, "Participants required");
        require(milestoneNames.length == milestoneRewards.length, "Invalid milestone config");

        uint256 challengeId = challengeCounter++;
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + duration;

        Challenge storage newChallenge = challenges[challengeId];
        newChallenge.name = name;
        newChallenge.track = track;
        newChallenge.creator = msg.sender;
        newChallenge.startDate = startDate;
        newChallenge.endDate = endDate;
        newChallenge.stakedAmount = msg.value;
        newChallenge.totalStake = msg.value;
        newChallenge.participants = participants;
        newChallenge.isActive = true;

        // Create milestones
        uint256 unlockInterval = duration / milestoneNames.length;
        for (uint i = 0; i < milestoneNames.length; i++) {
            newChallenge.milestones.push(Milestone({
                name: milestoneNames[i],
                unlockDate: startDate + (unlockInterval * i),
                reward: milestoneRewards[i],
                isUnlocked: i == 0, // First milestone starts unlocked
                isCompleted: false,
                firstCompletedBy: CompletionInfo(address(0), 0)
            }));
        }

        // Record transaction
        _recordTransaction(
            msg.sender,
            "staked",
            msg.value,
            string.concat("Staked for challenge: ", name)
        );

        // Update wallet summary
        walletSummaries[msg.sender].totalStaked += msg.value;

        emit ChallengeCreated(challengeId, name, msg.sender);
    }

    function completeMilestone(uint256 challengeId, uint256 milestoneIndex) 
        external 
        whenNotPaused
        nonReentrant 
        validChallenge(challengeId)
        onlyParticipant(challengeId)
    {
        Challenge storage challenge = challenges[challengeId];
        require(challenge.isActive, "Challenge not active");
        require(milestoneIndex < challenge.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = challenge.milestones[milestoneIndex];
        require(milestone.isUnlocked, "Milestone not unlocked");
        require(!milestone.isCompleted, "Milestone already completed");
        require(block.timestamp >= milestone.unlockDate, "Milestone not yet unlocked");

        milestone.isCompleted = true;
        milestone.firstCompletedBy = CompletionInfo(msg.sender, block.timestamp);

        // Award the reward
        uint256 reward = milestone.reward;
        walletSummaries[msg.sender].totalEarned += reward;
        walletSummaries[msg.sender].balance += reward;

        // Record transaction
        _recordTransaction(
            msg.sender,
            "earned",
            reward,
            string.concat("Completed milestone: ", milestone.name)
        );

        // Unlock next milestone if exists
        if (milestoneIndex + 1 < challenge.milestones.length) {
            challenge.milestones[milestoneIndex + 1].isUnlocked = true;
        }

        emit MilestoneCompleted(challengeId, milestoneIndex, msg.sender);
    }

    function deposit() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");

        walletSummaries[msg.sender].balance += msg.value;

        _recordTransaction(
            msg.sender,
            "deposited",
            msg.value,
            "Deposit to CodeStake wallet"
        );

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(walletSummaries[msg.sender].balance >= amount, "Insufficient balance");

        walletSummaries[msg.sender].balance -= amount;

        _recordTransaction(
            msg.sender,
            "withdrawn",
            amount,
            "Withdrawal from CodeStake wallet"
        );

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // View functions
    function getChallengeDetails(uint256 challengeId) 
        external 
        view 
        validChallenge(challengeId) 
        returns (Challenge memory) 
    {
        return challenges[challengeId];
    }

    function getWalletSummary(address user) external view returns (WalletSummary memory) {
        return walletSummaries[user];
    }

    function getTransactionHistory(address user) external view returns (Transaction[] memory) {
        return userTransactions[user];
    }

    function getActiveChallenges() external view returns (uint256[] memory) {
        uint256[] memory activeChallenges = new uint256[](challengeCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < challengeCounter; i++) {
            if (challenges[i].isActive) {
                activeChallenges[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeChallenges[i];
        }
        
        return result;
    }

    // Internal functions
    function _recordTransaction(
        address user,
        string memory txType,
        uint256 amount,
        string memory description
    ) internal {
        string memory txId = string(
            abi.encodePacked(
                "tx-",
                toString(block.timestamp),
                toString(uint160(user))
            )
        );

        Transaction memory newTx = Transaction({
            id: txId,
            txType: txType,
            amount: amount,
            timestamp: block.timestamp,
            description: description,
            challenge: ""
        });

        userTransactions[user].push(newTx);
    }

    // Helper functions
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Admin functions
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Fallback and receive functions
    receive() external payable {
        deposit();
    }

    fallback() external payable {
        deposit();
    }
} 