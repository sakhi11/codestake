import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

access(all) contract CodeStake {

    // ======= Structs =======

    access(all) struct CompletionInfo {
        access(all) let user: Address
        access(all) let timestamp: UFix64

        init(user: Address, timestamp: UFix64) {
            self.user = user
            self.timestamp = timestamp
        }
    }

    access(all) struct WalletSummary {
        access(all) var balance: UFix64
        access(all) var totalEarned: UFix64
        access(all) var totalStaked: UFix64

        init() {
            self.balance = 0.0
            self.totalEarned = 0.0
            self.totalStaked = 0.0
        }

        // mutators (access(all) as requested)
        access(all) fun deposit(_ amount: UFix64) {
            self.balance = self.balance + amount
        }

        access(all) fun withdraw(_ amount: UFix64) {
            self.balance = self.balance - amount
        }

        access(all) fun stake(_ amount: UFix64) {
            self.balance = self.balance - amount
            self.totalStaked = self.totalStaked + amount
        }

        access(all) fun earn(_ amount: UFix64) {
            self.balance = self.balance + amount
            self.totalEarned = self.totalEarned + amount
        }
    }

    access(all) struct Milestone {
        access(all) let id: Int
        access(all) let name: String
        access(all) let unlockDate: UFix64
        access(all) let reward: UFix64
        access(all) var isUnlocked: Bool
        access(all) var isCompleted: Bool
        access(all) var firstCompletedBy: CompletionInfo?

        init(id: Int, name: String, unlockDate: UFix64, reward: UFix64) {
            self.id = id
            self.name = name
            self.unlockDate = unlockDate
            self.reward = reward
            self.isUnlocked = false
            self.isCompleted = false
            self.firstCompletedBy = nil
        }

        access(all) fun complete(_ user: Address) {
            if !self.isCompleted {
                self.isCompleted = true
                self.firstCompletedBy = CompletionInfo(user: user, timestamp: getCurrentBlock().timestamp)
            }
        }

        access(all) fun unlockIfReady() {
            if !self.isUnlocked && getCurrentBlock().timestamp >= self.unlockDate {
                self.isUnlocked = true
            }
        }
    }

    access(all) struct Challenge {
        access(all) let id: Int
        access(all) let name: String
        access(all) let track: String
        access(all) let creator: Address
        access(all) let startDate: UFix64
        access(all) let endDate: UFix64
        access(all) var stakedAmount: UFix64
        access(all) var totalStake: UFix64
        access(all) var participants: [Address]
        access(all) var isActive: Bool
        access(all) var milestones: [Milestone]

        init(
            id: Int,
            name: String,
            track: String,
            creator: Address,
            startDate: UFix64,
            endDate: UFix64,
            stakedAmount: UFix64,
            totalStake: UFix64,
            participants: [Address],
            isActive: Bool,
            milestones: [Milestone]
        ) {
            self.id = id
            self.name = name
            self.track = track
            self.creator = creator
            self.startDate = startDate
            self.endDate = endDate
            self.stakedAmount = stakedAmount
            self.totalStake = totalStake
            self.participants = participants
            self.isActive = isActive
            self.milestones = milestones
        }

        access(all) fun addStake(_ amount: UFix64) {
            self.totalStake = self.totalStake + amount
        }

        access(all) fun appendMilestone(_ m: Milestone) {
            self.milestones.append(m)
        }
    }

    access(all) struct Transaction {
        access(all) let id: String
        access(all) let txType: String // "earned", "staked", "deposited", "withdrawn"
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64
        access(all) let description: String
        access(all) let challenge: String

        init(
            id: String,
            txType: String,
            amount: UFix64,
            timestamp: UFix64,
            description: String,
            challenge: String
        ) {
            self.id = id
            self.txType = txType
            self.amount = amount
            self.timestamp = timestamp
            self.description = description
            self.challenge = challenge
        }
    }

    // ======= Events =======
    access(all) event ChallengeCreated(id: Int, name: String, creator: Address)
    access(all) event MilestoneCompleted(challengeId: Int, milestoneIndex: Int, completer: Address)
    access(all) event Deposited(user: Address, amount: UFix64)
    access(all) event Withdrawn(user: Address, amount: UFix64)
    access(all) event RewardClaimed(user: Address, amount: UFix64)

    // ======= Storage =======
    access(all) var challenges: {Int: Challenge}
    access(all) var walletSummaries: {Address: WalletSummary}
    access(all) var userTransactions: {Address: [Transaction]}
    access(all) var challengeCounter: Int
    access(all) var platformFee: UFix64

    // keep track of who joined which challenge
    access(all) var joined: {Int: {Address: Bool}}

    init() {
        self.challenges = {}
        self.walletSummaries = {}
        self.userTransactions = {}
        self.challengeCounter = 0
        self.platformFee = 0.005 // 0.5%
        self.joined = {}
    }

    // ======= Internal helpers for wallet mutation (read-modify-write) =======

    access(all) fun ensureWalletExists(address: Address) {
        if self.walletSummaries[address] == nil {
            self.walletSummaries[address] = WalletSummary()
        }
    }

    access(all) fun depositToWallet(address: Address, amount: UFix64) {
        self.ensureWalletExists(address: address)
        var ws = self.walletSummaries[address]!
        ws.deposit(amount)
        self.walletSummaries[address] = ws
    }

    access(all) fun withdrawFromWallet(address: Address, amount: UFix64) {
        self.ensureWalletExists(address: address)
        var ws = self.walletSummaries[address]!
        ws.withdraw(amount)
        self.walletSummaries[address] = ws
    }

    access(all) fun stakeFromWallet(address: Address, amount: UFix64) {
        self.ensureWalletExists(address: address)
        var ws = self.walletSummaries[address]!
        ws.stake(amount)
        self.walletSummaries[address] = ws
    }

    access(all) fun earnToWallet(address: Address, amount: UFix64) {
        self.ensureWalletExists(address: address)
        var ws = self.walletSummaries[address]!
        ws.earn(amount)
        self.walletSummaries[address] = ws
    }

    // ======= Challenge helpers (read-modify-write) =======

    access(all) fun addStakeToChallenge(challengeId: Int, amount: UFix64) {
        let ch = self.challenges[challengeId]
        assert(ch != nil, message: "Challenge not found")
        var mod = ch!
        mod.addStake(amount)
        self.challenges[challengeId] = mod
    }

    access(all) fun completeMilestoneInternal(challengeId: Int, milestoneIndex: Int, user: Address) {
        let ch = self.challenges[challengeId]
        assert(ch != nil, message: "Challenge not found")
        var mod = ch!

        assert(milestoneIndex >= 0 && milestoneIndex < mod.milestones.length, message: "Invalid milestone index")

        // ensure milestone unlocked
        var ms = mod.milestones[milestoneIndex]
        ms.unlockIfReady()
        assert(ms.isUnlocked, message: "Milestone not unlocked")
        assert(!ms.isCompleted, message: "Milestone already completed")

        ms.complete(user)
        // write back the milestone and challenge
        mod.milestones[milestoneIndex] = ms
        self.challenges[challengeId] = mod

        // award reward
        let reward = ms.reward
        self.earnToWallet(address: user, amount: reward)

        // emit event
        emit MilestoneCompleted(challengeId: challengeId, milestoneIndex: milestoneIndex, completer: user)
    }

    access(all) fun isParticipant(challengeId: Int, participant: Address): Bool {
        let challenge = self.challenges[challengeId]
        if challenge == nil {
            return false
        }
        for participantAddress in challenge!.participants {
            if participantAddress == participant {
                return true
            }
        }
        return false
    }

    access(all) fun hasJoined(challengeId: Int, participant: Address): Bool {
        let map = self.joined[challengeId]
        if map == nil {
            return false
        }
        return map![participant] == true
    }

    access(all) fun setJoined(challengeId: Int, participant: Address) {
        if self.joined[challengeId] == nil {
            self.joined[challengeId] = {}
        }
        var map = self.joined[challengeId]!
        map[participant] = true
        self.joined[challengeId] = map
    }

    access(all) fun addTransaction(
        user: Address,
        txType: String,
        amount: UFix64,
        timestamp: UFix64,
        description: String,
        challenge: String
    ) {
        if self.userTransactions[user] == nil {
            self.userTransactions[user] = []
        }

        let tx = Transaction(
            id: "tx_".concat(self.challengeCounter.toString()),
            txType: txType,
            amount: amount,
            timestamp: timestamp,
            description: description,
            challenge: challenge
        )

        self.userTransactions[user]!.append(tx)
    }

    // ======= Public-ish functions (access(all)) =======

    access(all) fun createChallenge(
        name: String,
        track: String,
        duration: UFix64,
        participants: [Address],
        milestoneNames: [String],
        milestoneRewards: [UFix64],
        stakeAmount: UFix64
    ) {
        let caller = self.account.address
        self.ensureWalletExists(address: caller)

        var ws = self.walletSummaries[caller]!
        assert(stakeAmount > 0.0, message: "Stake required")
        assert(ws.balance >= stakeAmount, message: "Insufficient balance")
        assert(participants.length > 0, message: "Must have participants")
        assert(milestoneNames.length > 0, message: "Must have milestones")
        assert(milestoneNames.length == milestoneRewards.length, message: "Milestone arrays must match")

        // Deduct stake amount from creator's balance and update totals
        self.stakeFromWallet(address: caller, amount: stakeAmount)

        // Create milestones
        var milestones: [Milestone] = []
        var i = 0
        while i < milestoneNames.length {
            let multiplier = UFix64(i + 1)
            let m = Milestone(
                id: i,
                name: milestoneNames[i],
                unlockDate: getCurrentBlock().timestamp + (duration * multiplier),
                reward: milestoneRewards[i]
            )
            milestones.append(m)
            i = i + 1
        }

        // Create challenge
        let id = self.challengeCounter
        let challenge = Challenge(
            id: id,
            name: name,
            track: track,
            creator: caller,
            startDate: getCurrentBlock().timestamp,
            endDate: getCurrentBlock().timestamp + duration,
            stakedAmount: stakeAmount,
            totalStake: stakeAmount,
            participants: participants,
            isActive: true,
            milestones: milestones
        )

        self.challenges[id] = challenge
        self.challengeCounter = self.challengeCounter + 1

        // mark creator as joined automatically
        self.setJoined(challengeId: id, participant: caller)

        // Add transaction record
        self.addTransaction(
            user: caller,
            txType: "staked",
            amount: stakeAmount,
            timestamp: getCurrentBlock().timestamp,
            description: "Created challenge: ".concat(name),
            challenge: name
        )

        emit ChallengeCreated(id: id, name: name, creator: caller)
    }

    access(all) fun joinChallenge(challengeId: Int, stakeAmount: UFix64) {
        let caller = self.account.address
        let challenge = self.challenges[challengeId]
        assert(challenge != nil, message: "Challenge not found")
        assert(challenge!.isActive, message: "Challenge not active")
        assert(self.isParticipant(challengeId: challengeId, participant: caller), message: "Not a participant")
        assert(!self.hasJoined(challengeId: challengeId, participant: caller), message: "Already joined")

        // ensure and deduct
        self.ensureWalletExists(address: caller)
        var ws = self.walletSummaries[caller]!
        assert(ws.balance >= stakeAmount, message: "Insufficient balance")

        self.stakeFromWallet(address: caller, amount: stakeAmount)

        // Update challenge total stake
        self.addStakeToChallenge(challengeId: challengeId, amount: stakeAmount)

        // mark joined
        self.setJoined(challengeId: challengeId, participant: caller)

        // Add transaction record
        self.addTransaction(
            user: caller,
            txType: "staked",
            amount: stakeAmount,
            timestamp: getCurrentBlock().timestamp,
            description: "Joined challenge: ".concat(challenge!.name),
            challenge: challenge!.name
        )
    }

    access(all) fun completeMilestone(challengeId: Int, milestoneIndex: Int) {
        let caller = self.account.address
        let challenge = self.challenges[challengeId]
        assert(challenge != nil, message: "Challenge not found")
        assert(challenge!.isActive, message: "Challenge not active")
        assert(self.isParticipant(challengeId: challengeId, participant: caller), message: "Not a participant")
        assert(self.hasJoined(challengeId: challengeId, participant: caller), message: "User has not joined this challenge")

        self.completeMilestoneInternal(challengeId: challengeId, milestoneIndex: milestoneIndex, user: caller)

        // add transaction record (reward was already credited)
        let ch = self.challenges[challengeId]!
        let ms = ch.milestones[milestoneIndex]
        self.addTransaction(
            user: caller,
            txType: "earned",
            amount: ms.reward,
            timestamp: getCurrentBlock().timestamp,
            description: "Completed milestone: ".concat(ms.name),
            challenge: ch.name
        )
    }

    access(all) fun deposit(amount: UFix64) {
        let caller = self.account.address
        assert(amount > 0.0, message: "Amount must be positive")
        self.depositToWallet(address: caller, amount: amount)

        // Add transaction record
        self.addTransaction(
            user: caller,
            txType: "deposited",
            amount: amount,
            timestamp: getCurrentBlock().timestamp,
            description: "Deposited FLOW",
            challenge: ""
        )

        emit Deposited(user: caller, amount: amount)
    }

    access(all) fun withdraw(amount: UFix64) {
        let caller = self.account.address
        assert(amount > 0.0, message: "Amount must be positive")
        self.ensureWalletExists(address: caller)
        let ws = self.walletSummaries[caller]!
        assert(ws.balance >= amount, message: "Insufficient balance")

        self.withdrawFromWallet(address: caller, amount: amount)

        // Add transaction record
        self.addTransaction(
            user: caller,
            txType: "withdrawn",
            amount: amount,
            timestamp: getCurrentBlock().timestamp,
            description: "Withdrew FLOW",
            challenge: ""
        )

        emit Withdrawn(user: caller, amount: amount)
    }

    // ======= Getters =======

    access(all) fun getChallenge(challengeId: Int): Challenge? {
        return self.challenges[challengeId]
    }

    access(all) fun getWalletSummary(address: Address): WalletSummary? {
        return self.walletSummaries[address]
    }

    access(all) fun getUserTransactions(address: Address): [Transaction]? {
        return self.userTransactions[address]
    }

    access(all) fun hasUserJoined(challengeId: Int, address: Address): Bool {
        return self.hasJoined(challengeId: challengeId, participant: address)
    }
}
