import { ConfigService } from '@kiltprotocol/config';
import { connect } from '@kiltprotocol/core';

export async function initKiltSDK(): Promise<void> {
  const endpoint = process.env.CHAIN_ENDPOINT;
  if (!endpoint) {
    throw new Error('Blockchain endpoint not defined');
  }

  if (!ConfigService.isSet('api') || !ConfigService.get('api').isConnected) {
    await connect(endpoint);
  }
}
