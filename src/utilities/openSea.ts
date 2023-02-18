import { parse } from '@kiltprotocol/asset-did';
import { AssetDidUri, Caip2ChainId } from '@kiltprotocol/types';
import { invert } from 'lodash-es';

type OpenSeaChain =
  | 'arbitrum'
  | 'avalanche'
  | 'bsc'
  | 'ethereum'
  | 'klaytn'
  | 'matic'
  | 'optimism'
  | 'goerli';

export const openSeaChainIds: Record<OpenSeaChain, Caip2ChainId> = {
  arbitrum: 'eip155:42161',
  avalanche: 'eip155:43114',
  bsc: 'eip155:56',
  ethereum: 'eip155:1',
  klaytn: 'eip155:8217',
  matic: 'eip155:137',
  optimism: 'eip155:10',
  goerli: 'eip155:5', // testnet
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

  const openSeaChainNames = invert(openSeaChainIds) as Record<
    Caip2ChainId,
    OpenSeaChain
  >;

  const chainName = openSeaChainNames[chainId];
  if (chainName) {
    const base =
      chainName === 'goerli'
        ? 'https://testnets.opensea.io'
        : 'https://opensea.io';

    return `${base}/assets/${chainName}/${assetReference}/${assetInstance}`;
  }
}
