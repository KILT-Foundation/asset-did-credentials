import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import './App.css';
import {
  AssetDid,
  isAssetDid,
  isOpenSeaAssetLink,
  parseAssetDid,
  parseOpenSeaAssetLink,
} from './utilities';

const initialValues = {
  chainID: '',
  assetNamespace: '',
  assetReference: '',
  assetID: '',
};

export function App() {
  const [assetDidFields, setAssetDidFields] = useState(initialValues);

  const assetDid: AssetDid | undefined = useMemo(() => {
    const { chainID, assetNamespace, assetReference, assetID } = assetDidFields;

    const constructed = assetID
      ? `did:asset:${chainID}.${assetNamespace}:${assetReference}:${assetID}`
      : `did:asset:${chainID}.${assetNamespace}:${assetReference}`;

    if (isAssetDid(constructed)) {
      return constructed;
    }
  }, [assetDidFields]);

  const handleUrlInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    setAssetDidFields(initialValues);

    if (isAssetDid(input)) {
      setAssetDidFields(parseAssetDid(input));
    }

    if (isOpenSeaAssetLink(input)) {
      setAssetDidFields(parseOpenSeaAssetLink(input));
    }
  }, []);

  return (
    <form className="container">
      <h1 className="heading">Asset DIDs and Public Credentials</h1>

      <label className="urlLabel">
        OpenSea Link or Asset DID
        <input type="url" className="urlInput" onChange={handleUrlInput} />
      </label>

      <hr className="line" />

      <section className="assetDidFields">
        did:asset:{' '}
        <label className="fieldLabel">
          Chain ID
          <input
            className="fieldValue"
            value={assetDidFields.chainID}
            onChange={(event) =>
              setAssetDidFields({
                ...assetDidFields,
                chainID: event?.target.value,
              })
            }
          />
        </label>
        .
        <label className="fieldLabel">
          Asset Namespace
          <input
            className="fieldValue"
            value={assetDidFields.assetNamespace}
            onChange={(event) =>
              setAssetDidFields({
                ...assetDidFields,
                assetNamespace: event?.target.value,
              })
            }
          />
        </label>
        :
        <label className="fieldLabel">
          Asset Reference
          <input
            className="fieldValue"
            value={assetDidFields.assetReference}
            onChange={(event) =>
              setAssetDidFields({
                ...assetDidFields,
                assetReference: event?.target.value,
              })
            }
          />
        </label>
        :
        <label className="fieldLabel">
          Asset ID
          <input
            className="fieldValue"
            value={assetDidFields.assetID}
            onChange={(event) =>
              setAssetDidFields({
                ...assetDidFields,
                assetID: event?.target.value,
              })
            }
          />
        </label>
      </section>

      <output>
        {assetDid && (
          <dl className="assetDid">
            <dt>Asset DID:</dt>
            <dd>{assetDid}</dd>
          </dl>
        )}
      </output>
    </form>
  );
}
