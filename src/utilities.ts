// OpenSea types
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

export type OpenSeaAssetLink =
  `https://opensea.io/assets/${OpenSeaChain}/${string}/${string}`;

// Asset DID types
type ChainID = `${string}:${string}`;
type Asset = `.${string}:${string}`;
type AssetID = '' | `:${string}`;

export type AssetDid = `did:asset:${ChainID}${Asset}${AssetID}`;

function isNamespace(input: string) {
  return /^[-a-z0-9]{3,8}$/.test(input);
}

function isChainReference(input: string) {
  return /^[-a-zA-Z0-9]{1,32}$/.test(input);
}

function isAssetReference(input: string) {
  return /^[-a-zA-Z0-9]{1,64}$/.test(input);
}

function isAssetID(input: string) {
  return /^[-a-zA-Z0-9]{1,78}$/.test(input);
}

export function isAssetDid(input: string): input is AssetDid {
  if (!input.startsWith('did:asset:')) {
    return false;
  }
  const withoutPrefix = input.replace('did:asset:', '');

  const [chainID, asset] = withoutPrefix.split('.');

  const [chainNamespace, chainReference] = chainID.split(':');
  if (!isNamespace(chainNamespace) || !isChainReference(chainReference)) {
    return false;
  }

  const [assetNamespace, assetReference, assetID] = asset.split(':');

  if (
    !isNamespace(assetNamespace) ||
    !isAssetReference(assetReference) ||
    !isAssetID(assetID)
  ) {
    return false;
  }

  return true;
}

export function parseAssetDid(assetDid: AssetDid) {
  const withoutPrefix = assetDid.replace('did:asset:', '');

  const [chainID, asset] = withoutPrefix.split('.');

  const [assetNamespace, assetReference, assetID] = asset.split(':');
  return { chainID, assetNamespace, assetReference, assetID };
}

export function isOpenSeaAssetLink(input: string): input is OpenSeaAssetLink {
  if (!input.startsWith('https://opensea.io/assets/')) {
    return false;
  }
  const assetEndpoint = input.replace('https://opensea.io/assets/', '');

  const [chainName, assetReference, assetID] = assetEndpoint.split('/');

  if (!Object.keys(openSeaChainIDs).includes(chainName)) {
    return false;
  }

  if (!isAssetReference(assetReference) || !isAssetID(assetID)) {
    return false;
  }

  return true;
}

export function parseOpenSeaAssetLink(link: OpenSeaAssetLink) {
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
