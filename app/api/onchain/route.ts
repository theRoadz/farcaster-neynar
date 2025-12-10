import { NextRequest, NextResponse } from 'next/server';

// Public RPC endpoints for each chain
const RPC_ENDPOINTS = {
  ethereum: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
  base: process.env.BASE_RPC || 'https://mainnet.base.org',
  optimism: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
  arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
};

async function getTransactionCount(rpcUrl: string, address: string): Promise<number> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.result) {
      return parseInt(data.result, 16);
    }
    return 0;
  } catch (error) {
    console.error(`RPC error for ${rpcUrl}:`, error);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
  }

  try {
    // Fetch transaction counts from all chains in parallel
    const [ethereum, base, optimism, arbitrum] = await Promise.all([
      getTransactionCount(RPC_ENDPOINTS.ethereum, address),
      getTransactionCount(RPC_ENDPOINTS.base, address),
      getTransactionCount(RPC_ENDPOINTS.optimism, address),
      getTransactionCount(RPC_ENDPOINTS.arbitrum, address),
    ]);

    return NextResponse.json({
      address,
      transactions: {
        ethereum,
        base,
        optimism,
        arbitrum,
      },
      total: ethereum + base + optimism + arbitrum,
    });
  } catch (error) {
    console.error('Onchain fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch onchain data' }, { status: 500 });
  }
}
