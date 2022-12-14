const subscanHosts: Record<string, string> = {
  'wss://peregrine.kilt.io/parachain-public-ws':
    'https://kilt-testnet.subscan.io',
  'wss://spiritnet.kilt.io': 'https://spiritnet.subscan.io',
  'wss://kilt-rpc.dwellir.com': 'https://spiritnet.subscan.io',
};

export function getSubscanHost(): string {
  const endpoint = process.env.CHAIN_ENDPOINT as string;
  if (!endpoint) {
    throw new Error('Chain endpoint not defined');
  }
  return subscanHosts[endpoint];
}
