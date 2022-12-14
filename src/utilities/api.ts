import { ConfigService } from '@kiltprotocol/config';
import { connect } from '@kiltprotocol/core';

export async function getApi() {
  if (!ConfigService.isSet('api') || !ConfigService.get('api').isConnected) {
    return await connect(process.env.CHAIN_ENDPOINT as string);
  }
  return ConfigService.get('api');
}
