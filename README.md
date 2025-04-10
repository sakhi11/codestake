# CodeStake 🎯

**CodeStake** is a web app that turns learning into a challenge — quite literally! Compete with friends by staking a set amount and racing to complete learning milestones. Whoever hits the milestones first gets rewarded from the staked pool. It’s all about accountability, motivation, and a bit of friendly competition.

## 🚀 Why CodeStake?

- Learning is hard. Staying consistent is harder.
- With CodeStake, you **set learning goals**, **stake real value**, and **compete with a friend** to reach the finish line.
- The more you complete, the more you earn. Fall behind? Well, you snooze, you lose (your stake).

## 🧠 How It Works

1. **Create a Challenge:** Choose a topic, set milestones, and invite a friend.
2. **Stake an Amount:** Both parties lock in an equal stake.
3. **Track Progress:** Complete milestones and update progress.
4. **Win Rewards:** For every milestone achieved, the system distributes a portion of the stake to the one who reaches it first.

> Example: You and your friend stake ₹1000 each. For every milestone (e.g., completing a React module), the first to complete gets ₹200 from the pool.

## 🛠️ Tech Stack

- **Frontend:** React + Bun
- **Smart Contracts:** Solidity (Ethereum/Polygon based)
- **Blockchain Tools:** Ethers.js, Hardhat
- **Storage & Backend:** IPFS / Future plans for Supabase

## 📦 Getting Started

Clone the repo and get started locally:

```bash
git clone https://github.com/codewithrakshit/codestake.git
cd codestake
bun install
bun run dev
Make sure your local blockchain (like Hardhat or Ganache) is running and configured.

📁 Project Structure
php
Copy
Edit
codestake/
├── contracts/         # Smart contracts (stake + challenge logic)
├── src/               # React frontend code
├── public/            # Static files
├── scripts/           # Contract deployment and interaction
├── bun.lockb          # Bun package lock
└── README.md
✨ Features
Create & join learning challenges

Stake securely using blockchain

Real-time progress tracking

Auto-distribution of rewards on milestone completion

Minimal UI with intuitive UX

🧪 Upcoming Ideas
Group challenges with leaderboard

NFT badges for completed milestones

Learning resource suggestions for each topic

Discord/Slack bot integrations

🧑‍💻 Contributing
Got ideas to improve CodeStake? Contributions are welcome! Fork the repo, make your changes, and send a PR.

📄 License
MIT License — feel free to remix and build on it.

💡 CodeStake isn’t just about winning. It’s about growing — and doing it with people who push you to be better.
