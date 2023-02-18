import { validateUri } from '@kiltprotocol/asset-did';
import { AssetDidUri } from '@kiltprotocol/types';

export function isAssetDidUri(uri: string): uri is AssetDidUri {
  try {
    validateUri(uri);
    return true;
  } catch {
    return false;
  }
}
