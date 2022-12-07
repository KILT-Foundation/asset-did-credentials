import {
  AssetDid,
  isAssetID,
  isAssetReference,
  parseAssetDid,
} from './assetDid';

type OpenSeaChain =
  | 'arbitrum'
  | 'avalanche'
  | 'bsc'
  | 'ethereum'
  | 'klaytn'
  | 'matic'
  | 'optimism';

const openSeaChainIDs: Record<OpenSeaChain, string> = {
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

  const [chainName, assetReference, assetID] = assetEndpoint.split('/');

  if (!chainName || !assetReference || !assetID) {
    return false;
  }

  if (!Object.keys(openSeaChainIDs).includes(chainName)) {
    return false;
  }

  if (!isAssetReference(assetReference) || !isAssetID(assetID)) {
    return false;
  }

  return true;
}

export function parseOpenSeaUrl(link: OpenSeaUrl) {
  const assetEndpoint = link.replace('https://opensea.io/assets/', '');

  const [chainName, assetReference, assetID] = assetEndpoint.split('/');

  return {
    chainID: openSeaChainIDs[chainName as OpenSeaChain],
    // not part of OpenSea URL, but will be erc721 in most cases
    assetNamespace: 'erc721',
    assetReference,
    assetID,
  };
}

export function getOpenSeaUrl(did: AssetDid) {
  const { chainID, assetReference, assetID } = parseAssetDid(did);

  if (Object.values(openSeaChainIDs).includes(chainID)) {
    const chainName = (
      Object.keys(openSeaChainIDs) as (keyof typeof openSeaChainIDs)[]
    ).find((key) => openSeaChainIDs[key] === chainID);
    return `https://opensea.io/assets/${chainName}/${assetReference}/${assetID}`;
  }
}
