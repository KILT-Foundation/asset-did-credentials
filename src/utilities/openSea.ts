import { parse } from '@kiltprotocol/asset-did';
import { AssetDidUri } from '@kiltprotocol/types';

type OpenSeaChain =
  | 'arbitrum'
  | 'avalanche'
  | 'bsc'
  | 'ethereum'
  | 'klaytn'
  | 'matic'
  | 'optimism';

export const openSeaChainIds: Record<OpenSeaChain, string> = {
  arbitrum: 'eip155:42161',
  avalanche: 'eip155:43114',
  bsc: 'eip155:56',
  ethereum: 'eip155:1',
  klaytn: 'eip155:8217',
  matic: 'eip155:137',
  optimism: 'eip155:10',
};

export type OpenSeaUrl =
  `https://opensea.io/assets/${OpenSeaChain}/${string}/${string}`;

export function isOpenSeaUrl(input: string): input is OpenSeaUrl {
  if (!input.startsWith('https://opensea.io/assets/')) {
    return false;
  }
  const assetEndpoint = input.replace('https://opensea.io/assets/', '');

  const [chainName, assetReference, assetInstance] = assetEndpoint.split('/');

  if (!chainName || !assetReference || !assetInstance) {
    return false;
  }

  if (!Object.keys(openSeaChainIds).includes(chainName)) {
    return false;
  }

  return true;
}

export function parseOpenSeaUrl(link: OpenSeaUrl) {
  const assetEndpoint = link.replace('https://opensea.io/assets/', '');

  const [chainName, assetReference, assetInstance] = assetEndpoint.split('/');

  return {
    chainId: openSeaChainIds[chainName as OpenSeaChain],
    // not part of OpenSea URL, but will be erc721 in most cases
    assetNamespace: 'erc721',
    assetReference,
    assetInstance,
  };
}

export function getOpenSeaUrl(did: AssetDidUri) {
  const { chainId, assetReference, assetInstance } = parse(did);

  if (Object.values(openSeaChainIds).includes(chainId)) {
    const chainName = (
      Object.keys(openSeaChainIds) as (keyof typeof openSeaChainIds)[]
    ).find((key) => openSeaChainIds[key] === chainId);
    return `https://opensea.io/assets/${chainName}/${assetReference}/${assetInstance}`;
  }
}
