type ChainID = `${string}:${string}`;
type Asset = `.${string}:${string}`;
type AssetID = '' | `:${string}`;

export type AssetDid = `did:asset:${ChainID}${Asset}${AssetID}`;

export function isNamespace(input: string) {
  return /^[-a-z0-9]{3,8}$/.test(input);
}

export function isChainReference(input: string) {
  return /^[-a-zA-Z0-9]{1,32}$/.test(input);
}

export function isAssetReference(input: string) {
  return /^[-a-zA-Z0-9]{1,64}$/.test(input);
}

export function isAssetID(input: string) {
  return /^[-a-zA-Z0-9]{1,78}$/.test(input);
}

export function isAssetDid(input: string): input is AssetDid {
  if (!input.startsWith('did:asset:')) {
    return false;
  }
  const withoutPrefix = input.replace('did:asset:', '');

  const [chainID, asset] = withoutPrefix.split('.');
  if (!chainID || !asset) {
    return false;
  }

  const [chainNamespace, chainReference] = chainID.split(':');
  if (!chainNamespace || !chainReference) {
    return false;
  }
  if (!isNamespace(chainNamespace) || !isChainReference(chainReference)) {
    return false;
  }

  const [assetNamespace, assetReference, assetID] = asset.split(':');
  if (!chainNamespace || !assetReference) {
    return false;
  }
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
  return { chainID, assetNamespace, assetReference, assetID: assetID || '' };
}
