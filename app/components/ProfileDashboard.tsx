'use client';

import { useState } from 'react';
import CircularProgress from './CircularProgress';

interface UserData {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  verifiedAddresses: string[];
  custodyAddress: string;
  powerBadge: boolean;
  metrics: {
    followerQuality: number;
    engagementRate: number;
    avgReactions: number;
    viralReach: number;
    avgRecasts: number;
    activityLevel: string;
    accountAgeDays: number;
    totalCasts: number;
  };
}

interface OnchainData {
  address: string;
  transactions: {
    ethereum: number;
    base: number;
    optimism: number;
    arbitrum: number;
  };
  total: number;
}

export default function ProfileDashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'fid'>('username');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [onchainData, setOnchainData] = useState<OnchainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    if (!searchInput.trim()) {
      setError('Please enter a username or FID');
      return;
    }

    setLoading(true);
    setError('');
    setUserData(null);
    setOnchainData(null);

    try {
      // Determine search parameter based on search type
      const param = searchType === 'fid'
        ? `fid=${encodeURIComponent(searchInput.trim())}`
        : `username=${encodeURIComponent(searchInput.trim())}`;

      // Fetch user data from Neynar
      const userRes = await fetch(`/api/user?${param}`);
      const userJson = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userJson.error || 'Failed to fetch user data');
      }

      setUserData(userJson);

      // Fetch onchain data if user has verified addresses
      const address = userJson.verifiedAddresses?.[0] || userJson.custodyAddress;
      if (address) {
        const onchainRes = await fetch(`/api/onchain?address=${address}`);
        const onchainJson = await onchainRes.json();
        if (onchainRes.ok) {
          setOnchainData(onchainJson);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getViralReachLabel = (reach: number) => {
    if (reach >= 50) return 'Excellent';
    if (reach >= 25) return 'Good';
    if (reach >= 10) return 'Average';
    return 'Needs Work';
  };

  const getViralReachColor = (reach: number) => {
    if (reach >= 50) return '#2ecc71';
    if (reach >= 25) return '#3498db';
    if (reach >= 10) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        {/* Search Type Toggle */}
        <div className="flex justify-center gap-4 mb-3">
          <button
            onClick={() => setSearchType('username')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              searchType === 'username'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Username
          </button>
          <button
            onClick={() => setSearchType('fid')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              searchType === 'fid'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            FID
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type={searchType === 'fid' ? 'number' : 'text'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUserData()}
            placeholder={searchType === 'fid' ? 'Enter Farcaster ID (e.g. 477069)' : 'Enter username (e.g. theroad)'}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={fetchUserData}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
      </div>

      {/* Profile Dashboard */}
      {userData && (
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6">
            {/* Profile Picture */}
            {userData.pfpUrl && (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-400 bg-gray-700">
                <img
                  src={userData.pfpUrl}
                  alt={userData.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Stats Row */}
            <div className="flex justify-center items-center gap-8 mb-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userData.followerCount.toLocaleString()}</div>
                <div className="text-sm text-purple-300">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userData.displayName}</div>
                <div className="text-sm text-gray-300">@{userData.username}</div>
                <div className="text-xs text-gray-400 mt-1">Joined:</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userData.followingCount.toLocaleString()}</div>
                <div className="text-sm text-purple-300">Following</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Follower Quality */}
            <div className="text-center">
              <h3 className="text-sm text-purple-300 mb-2">Follower Quality</h3>
              <CircularProgress
                value={userData.metrics.followerQuality}
                maxValue={100}
                size={100}
                strokeWidth={8}
                color="#9b59b6"
              />
              <div className="mt-2">
                <div className="text-xs text-gray-400">Engagement rate</div>
                <div className="text-sm text-gray-300">Avg. Reactions</div>
                <div className="text-lg font-bold text-white">{userData.metrics.avgReactions}</div>
              </div>
            </div>

            {/* Account Age & Activity */}
            <div className="text-center">
              <h3 className="text-sm text-purple-300 mb-2">Account Age</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {userData.metrics.accountAgeDays}d
              </div>
              <h3 className="text-sm text-purple-300 mt-4 mb-1">Activity Level</h3>
              <div className="text-xl font-medium text-yellow-400">
                {userData.metrics.activityLevel}
              </div>
            </div>

            {/* Viral Reach */}
            <div className="text-center">
              <h3 className="text-sm text-purple-300 mb-2">Viral Reach</h3>
              <CircularProgress
                value={userData.metrics.viralReach}
                maxValue={100}
                size={100}
                strokeWidth={8}
                color={getViralReachColor(userData.metrics.viralReach)}
                showPercentage={true}
              />
              <div className="mt-2">
                <div
                  className="text-sm font-medium"
                  style={{ color: getViralReachColor(userData.metrics.viralReach) }}
                >
                  {getViralReachLabel(userData.metrics.viralReach)}
                </div>
                <div className="text-xs text-gray-400">From followers</div>
                <div className="text-sm text-gray-300">Avg. Recasts</div>
                <div className="text-lg font-bold text-green-400">{userData.metrics.avgRecasts}</div>
              </div>
            </div>
          </div>

          {/* Onchain Activity */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-center text-lg font-semibold text-white mb-4">Onchain Activity</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-blue-400 mb-1">Base</div>
                <div className="text-xl font-bold text-blue-400">
                  {onchainData?.transactions.base ?? 0} txs
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-400 mb-1">Ethereum</div>
                <div className="text-xl font-bold text-purple-400">
                  {onchainData?.transactions.ethereum ?? 0} txs
                </div>
              </div>
              <div>
                <div className="text-sm text-red-400 mb-1">Optimism</div>
                <div className="text-xl font-bold text-red-400">
                  {onchainData?.transactions.optimism ?? 0} txs
                </div>
              </div>
              <div>
                <div className="text-sm text-cyan-400 mb-1">Arbitrum</div>
                <div className="text-xl font-bold text-cyan-400">
                  {onchainData?.transactions.arbitrum ?? 0} txs
                </div>
              </div>
            </div>
          </div>

          {/* FID */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-400">FID: {userData.fid}</span>
          </div>
        </div>
      )}
    </div>
  );
}
