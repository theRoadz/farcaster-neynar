# Farcaster Profile Dashboard

A Next.js web application that displays Farcaster user profiles with engagement metrics and onchain activity across multiple chains.

![Dashboard Preview](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **Profile Display**: View Farcaster user profiles with avatar, display name, bio
- **Social Metrics**: Followers, following counts
- **Engagement Analytics**:
  - Follower Quality Score (based on Neynar score)
  - Viral Reach (logarithmic scale for fair comparison)
  - Average Reactions & Recasts
  - Activity Level (Very Active, Active, Moderate, Inactive)
- **Account Age**: Estimated from FID
- **Onchain Activity**: Transaction counts across:
  - Base
  - Ethereum
  - Optimism
  - Arbitrum
- **Search Options**: Search by username or FID

## Prerequisites

- Node.js 18+
- npm or yarn
- [Neynar API Key](https://dev.neynar.com) (free tier available)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theRoadz/farcaster-neynar.git
   cd farcaster-neynar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Neynar API key:
   ```env
   NEYNAR_API_KEY=your_neynar_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEYNAR_API_KEY` | Yes | Your Neynar API key from [dev.neynar.com](https://dev.neynar.com) |
| `ETHEREUM_RPC` | No | Custom Ethereum RPC (default: public RPC) |
| `BASE_RPC` | No | Custom Base RPC (default: public RPC) |
| `OPTIMISM_RPC` | No | Custom Optimism RPC (default: public RPC) |
| `ARBITRUM_RPC` | No | Custom Arbitrum RPC (default: public RPC) |

## Project Structure

```
farcaster-neynar/
├── app/
│   ├── api/
│   │   ├── user/route.ts      # Neynar API integration
│   │   └── onchain/route.ts   # Blockchain RPC integration
│   ├── components/
│   │   ├── CircularProgress.tsx
│   │   └── ProfileDashboard.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.example
├── .env.local                  # Your local config (not committed)
└── package.json
```

## API Endpoints

### GET /api/user
Fetch Farcaster user data and engagement metrics.

**Query Parameters:**
- `username` - Farcaster username (e.g., `theroad`)
- `fid` - Farcaster ID (e.g., `477069`)

### GET /api/onchain
Fetch transaction counts across chains.

**Query Parameters:**
- `address` - Ethereum address (e.g., `0x...`)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **APIs**:
  - [Neynar](https://neynar.com) - Farcaster data
  - Public RPCs - Onchain data

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

```bash
npm run build
npm start
```

## Getting a Neynar API Key

1. Go to [dev.neynar.com](https://dev.neynar.com)
2. Sign up for a free account
3. Create a new app
4. Copy your API key

## License

MIT

## Credits

Built with [Claude Code](https://claude.com/claude-code)
