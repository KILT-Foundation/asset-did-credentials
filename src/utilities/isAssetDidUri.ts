import * as AssetDid from '@kiltprotocol/asset-did';
import { AssetDidUri } from '@kiltprotocol/sdk-js';

export function isAssetDidUri(uri: string): uri is AssetDidUri {
  try {
    AssetDid.validateUri(uri);
    return true;
  } catch {
    return false;
  }
}
