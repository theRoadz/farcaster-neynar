import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
  score?: number;
}

interface UserCast {
  hash: string;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  timestamp: string;
}

// Estimate account age from FID
// FID 1 was created around July 2022, current FIDs are ~800k+
// This is a rough approximation
function estimateAccountAgeDays(fid: number): number {
  const FID_START_DATE = new Date('2022-07-01');
  const CURRENT_MAX_FID = 900000;
  const daysSinceStart = Math.floor((Date.now() - FID_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const estimatedDaysSinceCreation = Math.floor((1 - fid / CURRENT_MAX_FID) * daysSinceStart);
  return Math.max(0, estimatedDaysSinceCreation);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const fid = searchParams.get('fid');

  if (!username && !fid) {
    return NextResponse.json({ error: 'Username or FID required' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'Neynar API key not configured' }, { status: 500 });
  }

  try {
    // Get user data
    let userData: NeynarUser;

    if (fid) {
      const userRes = await fetch(`${NEYNAR_BASE_URL}/user/bulk?fids=${fid}`, {
        headers: { 'x-api-key': NEYNAR_API_KEY },
      });
      const userJson = await userRes.json();
      userData = userJson.users?.[0];
    } else {
      const userRes = await fetch(`${NEYNAR_BASE_URL}/user/by_username?username=${username}`, {
        headers: { 'x-api-key': NEYNAR_API_KEY },
      });
      const userJson = await userRes.json();
      userData = userJson.user;
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's casts for engagement metrics
    const castsRes = await fetch(
      `${NEYNAR_BASE_URL}/feed/user/casts?fid=${userData.fid}&limit=50`,
      { headers: { 'x-api-key': NEYNAR_API_KEY } }
    );
    const castsJson = await castsRes.json();
    const casts: UserCast[] = castsJson.casts || [];

    // Calculate engagement metrics
    let totalLikes = 0;
    let totalRecasts = 0;
    let totalReplies = 0;

    casts.forEach((cast: UserCast) => {
      totalLikes += cast.reactions?.likes_count || 0;
      totalRecasts += cast.reactions?.recasts_count || 0;
      totalReplies += cast.replies?.count || 0;
    });

    const avgReactions = casts.length > 0
      ? Math.round((totalLikes + totalRecasts + totalReplies) / casts.length)
      : 0;
    const avgRecasts = casts.length > 0
      ? Math.round(totalRecasts / casts.length)
      : 0;

    // Use Neynar's score if available (0-1 scale, multiply by 100 for display)
    const engagementRate = userData.follower_count > 0
      ? (avgReactions / userData.follower_count) * 100
      : 0;
    const followerQuality = userData.score
      ? Math.round(userData.score * 100)
      : Math.min(100, Math.round(engagementRate * 10));

    // Calculate viral reach using logarithmic scale for better distribution
    // This handles both small and large accounts fairly
    // 0.01% recast rate = ~25%, 0.1% = ~50%, 1% = ~75%, 10% = ~100%
    let viralReach = 0;
    if (userData.follower_count > 0 && avgRecasts > 0) {
      const recastRate = (avgRecasts / userData.follower_count) * 100; // percentage
      viralReach = Math.min(100, Math.round(Math.log10(recastRate * 1000 + 1) * 25));
    }

    // Determine activity level based on recent casts
    let activityLevel = 'Unknown';
    if (casts.length > 0) {
      const latestCast = new Date(casts[0].timestamp);
      const daysSinceLastCast = Math.floor((Date.now() - latestCast.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastCast <= 1) activityLevel = 'Very Active';
      else if (daysSinceLastCast <= 7) activityLevel = 'Active';
      else if (daysSinceLastCast <= 30) activityLevel = 'Moderate';
      else activityLevel = 'Inactive';
    }

    // Estimate account age from FID
    const accountAgeDays = estimateAccountAgeDays(userData.fid);

    return NextResponse.json({
      fid: userData.fid,
      username: userData.username,
      displayName: userData.display_name,
      pfpUrl: userData.pfp_url,
      bio: userData.profile?.bio?.text || '',
      followerCount: userData.follower_count,
      followingCount: userData.following_count,
      verifiedAddresses: userData.verified_addresses?.eth_addresses || [],
      custodyAddress: userData.custody_address,
      powerBadge: userData.power_badge,
      neynarScore: userData.score,
      metrics: {
        followerQuality,
        engagementRate: Math.round(engagementRate * 100) / 100,
        avgReactions,
        viralReach,
        avgRecasts,
        activityLevel,
        accountAgeDays,
        totalCasts: casts.length,
      },
    });
  } catch (error) {
    console.error('Neynar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
