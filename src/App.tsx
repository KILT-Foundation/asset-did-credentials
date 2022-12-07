import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from 'react';

import './App.css';
import { AssetDid, isAssetDid, parseAssetDid } from './utilities/assetDid';
import {
  getOpenSeaUrl,
  isOpenSeaUrl,
  parseOpenSeaUrl,
} from './utilities/openSea';
import { useBooleanState } from './utilities/useBooleanState';

const initialValues = {
  chainID: '',
  assetNamespace: '',
  assetReference: '',
  assetID: '',
};

export function App() {
  const [assetDidInput, setAssetDidInput] = useState(initialValues);
  const { chainID, assetNamespace, assetReference, assetID } = assetDidInput;

  const [assetDid, setAssetDid] = useState<AssetDid>();

  const openSeaUrl = useMemo(() => {
    if (!assetDid || !assetID) {
      return;
    }
    return getOpenSeaUrl(assetDid);
  }, [assetDid, assetID]);

  const urlInputError = useBooleanState();
  const didInputError = useBooleanState();

  const handleUrlInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      urlInputError.off();
      didInputError.off();
      setAssetDid(undefined);

      const url = event.currentTarget.value;

      if (isAssetDid(url)) {
        setAssetDidInput(parseAssetDid(url));
        return;
      }

      if (isOpenSeaUrl(url)) {
        setAssetDidInput(parseOpenSeaUrl(url));
        return;
      }

      urlInputError.on();
      setAssetDidInput(initialValues);
    },
    [urlInputError, didInputError],
  );

  const handleDidInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      didInputError.off();
      setAssetDid(undefined);

      const key = event.currentTarget.name;
      const value = event.currentTarget.value;

      if (Object.keys(assetDidInput).includes(key)) {
        setAssetDidInput({ ...assetDidInput, [key]: value });
      }
    },
    [assetDidInput, didInputError],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      didInputError.off();
      setAssetDid(undefined);

      const { chainID, assetNamespace, assetReference, assetID } =
        assetDidInput;

      const string = assetID
        ? `did:asset:${chainID}.${assetNamespace}:${assetReference}:${assetID}`
        : `did:asset:${chainID}.${assetNamespace}:${assetReference}`;

      if (isAssetDid(string)) {
        setAssetDid(string);
      } else {
        didInputError.on();
      }
    },
    [assetDidInput, didInputError],
  );

  const disabled = !chainID || !assetNamespace || !assetReference;

  return (
    <section className="container">
      <h1 className="heading">Asset DID</h1>

      <form className="form" id="form" onSubmit={handleSubmit}>
        <section className="urlInput">
          <label className="urlInputLabel">
            OpenSea URL or Asset DID:
            <input className="urlInputValue" onChange={handleUrlInput} />
          </label>
        </section>

        <section className="didInput">
          {urlInputError.current && (
            <p className="urlError">
              Unable to parse URL. Please enter the asset data manually. See{' '}
              <a
                href="https://github.com/KILTprotocol/spec-asset-did"
                target="_blank"
                rel="noreferrer"
              >
                specification
              </a>{' '}
              for details.
            </p>
          )}
          <span>did:asset: </span>
          <label className="didInputLabel">
            Chain ID
            <input
              required
              className="didInputValue"
              name="chainID"
              value={chainID}
              onChange={handleDidInput}
            />
          </label>
          .
          <label className="didInputLabel">
            Token Standard
            <input
              required
              className="didInputValue"
              name="assetNamespace"
              value={assetNamespace}
              onChange={handleDidInput}
            />
          </label>
          :
          <label className="didInputLabel">
            Contract Address
            <input
              required
              className="didInputValue"
              name="assetReference"
              value={assetReference}
              onChange={handleDidInput}
            />
          </label>
          :
          <label className="didInputLabel">
            <p className="tokenID">
              <span>Token ID</span> <span className="optional">(Optional)</span>
            </p>
            <input
              className="didInputValue"
              name="assetID"
              value={assetID}
              onChange={handleDidInput}
            />
          </label>
        </section>

        <button disabled={disabled} type="submit">
          Continue
        </button>
      </form>

      <output form="form">
        {didInputError.current && <p className="error">Invalid input</p>}

        {!didInputError.current && assetDid && (
          <section>
            <dl className="assetDid">
              <dt>Asset DID:</dt>
              <dd>{assetDid}</dd>
            </dl>

            {openSeaUrl && (
              <a target="_blank" rel="noreferrer" href={openSeaUrl}>
                Is this your NFT?
              </a>
            )}
          </section>
          // TODO: Issue public credential: https://kiltprotocol.atlassian.net/browse/SK-1550
        )}
      </output>
    </section>
  );
}
