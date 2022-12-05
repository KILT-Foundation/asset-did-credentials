import { ChangeEvent, FormEvent, Fragment, useCallback, useState } from 'react';
import './App.css';

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

type OpenSeaAssetLink =
  `https://opensea.io/assets/${OpenSeaChain}/${string}/${string}`;

// Asset DID types
type ChainID = `${string}:${string}`;
type Asset = `.${string}:${string}`;
type AssetID = '' | `:${string}`;

type AssetDid = `did:asset:${ChainID}${Asset}${AssetID}`;

function isNamespace(input: string) {
  console.log('namespace: ', input);
  return /^[-a-z0-9]{3,8}$/.test(input);
}

function isChainReference(input: string) {
  console.log('chain reference: ', input);
  return /^[-a-zA-Z0-9]{1,32}$/.test(input);
}

function isAssetReference(input: string) {
  console.log('asset reference: ', input);
  return /^[-a-zA-Z0-9]{1,64}$/.test(input);
}

function isAssetID(input: string) {
  console.log('asset ID: ', input);
  return /^[-a-zA-Z0-9]{1,78}$/.test(input);
}

function isAssetDid(input: string): input is AssetDid {
  if (!input.startsWith('did:asset:')) {
    return false;
  }
  const withoutPrefix = input.replace('did:asset:', '');

  const [chainID, asset] = withoutPrefix.split('.');

  const [chainNamespace, chainReference] = chainID.split(':');
  if (!isNamespace(chainNamespace) || !isChainReference(chainReference)) {
    console.error('invalid chain syntax');
    return false;
  }

  const [assetNamespace, assetReference, assetID] = asset.split(':');

  if (
    !isNamespace(assetNamespace) ||
    !isAssetReference(assetReference) ||
    !isAssetID(assetID)
  ) {
    console.error('invalid asset syntax');
    return false;
  }

  return true;
}

function parseAssetDid(assetDid: AssetDid) {
  const withoutPrefix = assetDid.replace('did:asset:', '');

  const [chainID, asset] = withoutPrefix.split('.');

  const [assetNamespace, assetReference, assetID] = asset.split(':');
  return { chainID, assetNamespace, assetReference, assetID };
}

function isOpenSeaAssetLink(input: string): input is OpenSeaAssetLink {
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

function parseOpenSeaAssetLink(link: OpenSeaAssetLink) {
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

export function App() {
  const [input, setInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [parsed, setParsed] = useState<{
    chainID: string;
    assetNamespace: string;
    assetReference: string;
    assetID?: string;
  }>();

  const [isInvalid, setIsInvalid] = useState(false);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      setIsInvalid(false);
      setIsSubmitted(true);

      const lowerCase = input.toLowerCase();

      if (isAssetDid(lowerCase)) {
        setParsed(parseAssetDid(lowerCase));
        return;
      }
      if (isOpenSeaAssetLink(lowerCase)) {
        setParsed(parseOpenSeaAssetLink(lowerCase));
        return;
      }

      setParsed(undefined);
      setIsInvalid(true);
    },
    [input],
  );

  return (
    <form className="container" onSubmit={handleSubmit}>
      <h1 className="heading">Asset DIDs and Public Credentials</h1>

      <label className="urlLabel">
        OpenSea Link or Asset DID
        <input
          required
          type="url"
          className="urlInput"
          onChange={handleChange}
        />
      </label>
      <button disabled={!input} type="submit">
        Show Asset DID Breakdown
      </button>

      <hr className="line" />

      {isSubmitted && parsed && !isInvalid && (
        <output>
          <h2 className="assetDidHeading">Your Asset DID</h2>
          <div className="assetDidBreakdown">
            did:asset:{' '}
            <dl className="outputData">
              <div className="outputDataField">
                <dt>Blockchain</dt>
                <dd className="dataValue">{parsed.chainID}</dd>
              </div>
              .
              <div className="outputDataField">
                <dt>Asset Namespace</dt>
                <dd className="dataValue">{parsed.assetNamespace}</dd>
              </div>
              :
              <div className="outputDataField">
                <dt>Asset Reference</dt>
                <dd className="dataValue">{parsed.assetReference}</dd>
              </div>
              {parsed.assetID && (
                <Fragment>
                  :
                  <div className="outputDataField">
                    <dt>Asset ID</dt>
                    <dd className="dataValue">{parsed.assetID}</dd>
                  </div>
                </Fragment>
              )}
            </dl>
          </div>
        </output>
      )}

      {isInvalid && (
        <output>
          <p className="invalid">
            Invalid input. Please enter a valid asset DID or a link to a single
            asset on OpenSea.
          </p>
        </output>
      )}
    </form>
  );
}
