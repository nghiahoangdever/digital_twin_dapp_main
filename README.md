# 🧬 Digital Twin dApp on IOTA

A decentralized application for creating and managing Digital Twins (digital representations of physical assets) on the IOTA blockchain. Track asset lifecycle, monitor trust scores, and transfer ownership securely on-chain.

![IOTA](https://img.shields.io/badge/IOTA-131F37?style=for-the-badge&logo=iota&logoColor=white)
![Move](https://img.shields.io/badge/Move-000000?style=for-the-badge&logo=move&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Smart Contract](#-smart-contract)
- [Usage Guide](#-usage-guide)
- [Trust Score System](#-trust-score-system)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- 🎯 **Mint Digital Twins** - Create on-chain representations of physical assets
- 📊 **Trust Score Tracking** - Dynamic reliability scoring (0-100)
- 📜 **Lifecycle Events** - Record maintenance, damage, inspections, verifications
- 🔄 **Ownership Transfer** - Secure on-chain asset transfers
- 🚨 **Lost/Stolen Reporting** - Mark assets as lost with significant trust penalty

### UI/UX Features

- 🎨 Modern, responsive design with Radix UI
- 📱 Mobile-friendly interface
- 🔍 Real-time blockchain data fetching
- 💾 Persistent twin ID in URL (shareable links)
- ⚡ Loading states and error handling
- 🎭 Color-coded trust scores and status badges

---

## 🎥 Demo

### Screenshots

**Mint New Digital Twin**

```
┌─────────────────────────────────────┐
│ 🪪 Mint Your First Digital Twin    │
│                                     │
│ Asset Metadata:                     │
│ ┌─────────────────────────────────┐ │
│ │ Dell XPS 15 - SN: ABC123        │ │
│ │ Owner: John Doe                 │ │
│ │ Purchased: 2024-01-15           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [🎯 Mint Digital Twin]              │
└─────────────────────────────────────┘
```

**Asset Overview**

```
┌─────────────────────────────────────┐
│ 📦 Asset Overview      [Active 🟢]  │
│                                     │
│ TRUST SCORE                         │
│ 85/100 [Good]                       │
│ ████████████████████████░░░░░       │
│                                     │
│ METADATA                            │
│ Dell XPS 15 - SN: ABC123            │
│                                     │
│ OWNER [You]                         │
│ 0x1234...5678                       │
└─────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Blockchain

- **IOTA Blockchain** - Layer 1 DLT platform
- **Move Language** - Smart contract programming
- **IOTA SDK** - TypeScript SDK for blockchain interaction

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Radix UI** - Accessible component library
- **IOTA dApp Kit** - Wallet connection & blockchain hooks

### Development Tools

- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** >= 18.x
- **pnpm** >= 8.x (or npm/yarn)
- **IOTA Wallet** (browser extension or mobile app)
- **Git**

### IOTA Wallet Setup

1. Install [IOTA Wallet Extension](https://chrome.google.com/webstore) for Chrome/Brave
2. Create a new wallet or import existing one
3. Switch to **Devnet** network
4. Get test tokens from [IOTA Faucet](https://faucet.devnet.iota.cafe/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/digital-twin-dapp.git
cd digital-twin-dapp
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# IOTA Network Configuration
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_PACKAGE_ID=0x703c97fb88edc981081307351be009b7815b1f5ae2e31421e9ef9d84bf2b0856

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 4. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract

### Contract Details

- **Network:** `devnet`
- **Package ID:** `0x703c97fb88edc981081307351be009b7815b1f5ae2e31421e9ef9d84bf2b0856`
- **Module:** `contract`

### Contract Structure

```move
module digital_twin_dapp::contract {
    public struct DigitalTwin has key, store {
        id: UID,
        owner: address,
        metadata: vector<u8>,
        trust_score: u64,        // 0-100
        logs: vector<LifecycleEvent>,
    }

    public struct LifecycleEvent has copy, drop, store {
        event_type: u8,
        description: vector<u8>,
    }
}
```

### Available Functions

| Function          | Description             | Parameters                                                     |
| ----------------- | ----------------------- | -------------------------------------------------------------- |
| `mint_to_sender`  | Create new Digital Twin | `metadata: vector<u8>`                                         |
| `add_event`       | Add lifecycle event     | `twin: &mut DigitalTwin`, `event_type: u8`, `desc: vector<u8>` |
| `report_lost`     | Report asset as lost    | `twin: &mut DigitalTwin`                                       |
| `transfer_twin`   | Transfer ownership      | `twin: DigitalTwin`, `recipient: address`                      |
| `get_trust_score` | Get current trust score | `twin: &DigitalTwin`                                           |
| `get_owner`       | Get owner address       | `twin: &DigitalTwin`                                           |

### Deploying Your Own Contract

If you want to deploy your own version:

```bash
# 1. Install IOTA CLI
curl -fsSL https://docs.iota.org/install.sh | bash

# 2. Create new wallet
iota client new-address ed25519

# 3. Get devnet tokens
iota client faucet

# 4. Build and publish
cd contract/digital_twin_dapp
iota move build
iota client publish --gas-budget 100000000

# 5. Update NEXT_PUBLIC_PACKAGE_ID in .env.local
```

---

## 📖 Usage Guide

### 1. Mint a Digital Twin

```typescript
// Example metadata formats:

// Electronics
"Laptop Dell XPS 15 - Serial: ABC123XYZ - Purchased: 2024-01-15 - Owner: John Doe";

// Vehicles
"Tesla Model 3 - VIN: 5YJ3E1EA1KF123456 - Year: 2024 - Color: White";

// Luxury Goods
"Rolex Submariner - Ref: 116610LN - Serial: Z291234 - Purchase Date: 2023-06-10";

// Real Estate
"Apartment 5B - Address: 123 Main St, Hanoi - Area: 85sqm - Year Built: 2020";
```

### 2. Add Lifecycle Events

**Event Types:**

| Type | Name         | Trust Score Impact | Use Case                  |
| ---- | ------------ | ------------------ | ------------------------- |
| 1    | Maintenance  | +5                 | Regular upkeep, servicing |
| 2    | Damage       | -3                 | Minor issues, scratches   |
| 3    | Inspection   | +2                 | Quality checks, audits    |
| 4    | Lost         | -50                | Stolen, missing           |
| 5    | Verification | +10                | Official authentication   |

**Example Events:**

```typescript
// Maintenance
addEvent(1, "Battery replacement completed at authorized service center");

// Damage
addEvent(2, "Minor scratch on back panel - cosmetic only");

// Inspection
addEvent(3, "Annual quality inspection passed - Certificate #QC-2024-001");

// Verification
addEvent(5, "Authenticity verified by manufacturer - Serial confirmed");

// Report Lost
reportLost(); // Automatically adds event type 4
```

### 3. Transfer Ownership

```typescript
// Example recipient addresses (devnet):
transferTwin(
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
);
```

⚠️ **Important:**

- Only the current owner can transfer
- Transfers are irreversible
- Double-check recipient address

---

## 🎯 Trust Score System

### Score Calculation

```
Initial Score: 50/100 (neutral)
Maximum Score: 100/100
Minimum Score: 0/100
```

### Score Modifiers

| Event                  | Impact        | Example Scenario                               |
| ---------------------- | ------------- | ---------------------------------------------- |
| **Maintenance (+5)**   | Positive      | Regular servicing, repairs, upgrades           |
| **Damage (-3)**        | Negative      | Minor wear, cosmetic damage                    |
| **Inspection (+2)**    | Positive      | Quality checks, certifications                 |
| **Lost (-50)**         | Severe        | Stolen, missing, lost asset                    |
| **Verification (+10)** | Very Positive | Official authentication, warranty registration |

### Score Grades

| Range  | Grade     | Badge Color | Meaning                            |
| ------ | --------- | ----------- | ---------------------------------- |
| 90-100 | Excellent | 🟢 Green    | Perfect condition, well-maintained |
| 75-89  | Good      | 🔵 Teal     | Minor wear, reliable               |
| 50-74  | Fair      | 🟡 Yellow   | Moderate use, attention needed     |
| 25-49  | Poor      | 🟠 Orange   | Significant issues                 |
| 0-24   | Critical  | 🔴 Red      | Severe problems, lost              |

### Example Scenarios

**Scenario 1: Well-Maintained Laptop**

```
Mint                    → 50
+ Verification          → 60 (+10)
+ Maintenance           → 65 (+5)
+ Inspection            → 67 (+2)
+ Maintenance           → 72 (+5)
= Final Score: 72/100 (Fair)
```

**Scenario 2: Lost Asset**

```
Mint                    → 50
+ Verification          → 60 (+10)
+ Damage                → 57 (-3)
+ Report Lost           → 7 (-50)
= Final Score: 7/100 (Critical)
```

**Scenario 3: Premium Asset**

```
Mint                    → 50
+ Verification          → 60 (+10)
+ Verification          → 70 (+10)
+ Maintenance           → 75 (+5)
+ Inspection            → 77 (+2)
+ Maintenance           → 82 (+5)
+ Verification          → 92 (+10)
= Final Score: 92/100 (Excellent)
```

---

## 📁 Project Structure

```
digital-twin-dapp/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   └── sample.tsx               # Main Digital Twin UI component
├── hooks/
│   └── useContract.ts           # Contract interaction hook
├── lib/
│   └── config.ts                # Network configuration
├── contract/
│   └── digital_twin_dapp/
│       └── sources/
│           └── digital_twin_dapp.move  # Move smart contract
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
└── README.md                    # This file
```

### Key Files

**`hooks/useContract.ts`**

- Contract interaction logic
- Transaction handling
- State management
- Data fetching and parsing

**`components/sample.tsx`**

- Main UI component
- Form handling
- Event management
- Visual feedback

**`contract/digital_twin_dapp.move`**

- Smart contract source code
- Trust score logic
- Event management
- Ownership transfers

---

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/digital-twin-dapp)

1. **Connect GitHub Repository**

```bash
   git push origin main
```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**

```env
   NEXT_PUBLIC_NETWORK=devnet
   NEXT_PUBLIC_PACKAGE_ID=0x703c97fb88edc981081307351be009b7815b1f5ae2e31421e9ef9d84bf2b0856
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your live dApp!

### Deploy to Other Platforms

**Netlify:**

```bash
npm run build
netlify deploy --prod
```

**Self-Hosted:**

```bash
npm run build
npm start
```

---

## 🧪 Testing

### Run Tests (Coming Soon)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Contract tests
cd contract/digital_twin_dapp
iota move test
```

### Manual Testing Checklist

- [ ] Connect wallet successfully
- [ ] Mint new Digital Twin
- [ ] View twin details and trust score
- [ ] Add all event types
- [ ] Verify trust score calculations
- [ ] Transfer ownership (requires 2 wallets)
- [ ] Report lost functionality
- [ ] Error handling (invalid inputs, rejected transactions)
- [ ] Mobile responsiveness
- [ ] URL persistence (refresh page with twin ID)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

```bash
   git clone https://github.com/yourusername/digital-twin-dapp.git
```

2. **Create Feature Branch**

```bash
   git checkout -b feature/amazing-feature
```

3. **Commit Changes**

```bash
   git commit -m "Add amazing feature"
```

4. **Push to Branch**

```bash
   git push origin feature/amazing-feature
```

5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Test thoroughly before PR
- Update README if needed

---

## 🐛 Troubleshooting

### Common Issues

**1. Wallet Not Connecting**

```
Solution:
- Install IOTA wallet extension
- Switch to devnet network
- Refresh page
- Check browser console for errors
```

**2. Transaction Failing**

```
Solution:
- Ensure sufficient gas (get from faucet)
- Check object ownership
- Verify contract address
- Try again after a few seconds
```

**3. Object Not Found**

```
Solution:
- Clear URL hash and mint new twin
- Check if using correct network (devnet)
- Verify object ID is correct
```

**4. Trust Score Not Updating**

```
Solution:
- Wait for transaction confirmation
- Refresh the page
- Check event was added successfully
```

---

## 📚 Resources

### IOTA Documentation

- [IOTA Docs](https://docs.iota.org)
- [Move Language Guide](https://docs.iota.org/developer/getting-started/move)
- [IOTA SDK](https://sdk.iota.org)

### Related Projects

- [IOTA dApp Kit](https://github.com/iotaledger/iota-dapp-kit)
- [Move Examples](https://github.com/MystenLabs/sui/tree/main/examples)

### Community

- [IOTA Discord](https://discord.iota.org)
- [IOTA Forum](https://forum.iota.org)
- [GitHub Discussions](https://github.com/yourusername/digital-twin-dapp/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Acknowledgments

- IOTA Foundation for the blockchain infrastructure
- Radix UI team for the component library
- Next.js team for the amazing framework
- Move language developers

---

## 📧 Contact

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

**Project Link:** [https://github.com/yourusername/digital-twin-dapp](https://github.com/yourusername/digital-twin-dapp)

---

<p align="center">
  Made with ❤️ by Your Name
  <br/>
  <a href="#-digital-twin-dapp-on-iota">Back to top ⬆️</a>
</p>
