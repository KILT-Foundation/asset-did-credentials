import { createRoot } from 'react-dom/client';

import { AssetDid } from './components/AssetDid/AssetDid';

const container = document.getElementById('root') as HTMLElement;

const root = createRoot(container);

root.render(<AssetDid />);
