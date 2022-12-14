import { createRoot } from 'react-dom/client';

import { AssetDid } from './components/AssetDid/AssetDid';
import { initKiltSDK } from './utilities/initKiltSDK';

(async () => {
  const endpoint = process.env.CHAIN_ENDPOINT;

  if (!endpoint) {
    throw new Error('Blockchain endpoint not defined');
  }

  await initKiltSDK();

  const container = document.getElementById('root') as HTMLElement;

  const root = createRoot(container);

  root.render(<AssetDid />);
})();
