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

![alt text](<images/screenshot/Screenshot 2025-12-07 134427.png>)

## Explorer Link & Contract Address

- **Network**: Testnet
- **Package ID**: `0x140e767b2d4c62840db4082879aec4d48c7d92f06a94c3fe0123bee0028b4bbd`
- **Explorer**: [View on IOTA Explorer](https://explorer.iota.org/object/0x140e767b2d4c62840db4082879aec4d48c7d92f06a94c3fe0123bee0028b4bbd?network=testnet)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Deploy the smart contract
npm run iota-deploy

# Start development server
npm run dev
```

## 🛠️ Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Blockchain**: IOTA Smart Contracts (Move)
- **Wallet**: IOTA dApp Kit
- **UI**: Radix UI, Tailwind CSS
- **State Management**: TanStack Query

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
