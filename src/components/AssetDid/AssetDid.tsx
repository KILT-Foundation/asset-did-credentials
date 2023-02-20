import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  Fragment,
  useCallback,
  useState,
} from 'react';

import { AssetDidUri } from '@kiltprotocol/types';

import * as styles from './AssetDid.module.css';

import { getOpenSeaUrl, openSeaChainIds } from '../../utilities/openSea';
import { useBooleanState } from '../../utilities/useBooleanState';
import { PublicCredentials } from '../PublicCredentials/PublicCredentials';
import { BuildDid } from '../BuildDid/BuildDid';
import { isAssetDidUri } from '../../utilities/isAssetDidUri';

export interface AssetDidElements {
  chainId: string;
  assetNamespace: string;
  assetReference: string;
  assetInstance: string;
}

function DidInput({
  handleInput,
  initialValues,
}: {
  handleInput: ChangeEventHandler;
  initialValues: AssetDidElements;
}) {
  const { chainId, assetNamespace, assetReference, assetInstance } =
    initialValues;
  return (
    <section className={styles.didInput}>
      <span>did:asset: </span>
      <label className={styles.didInputLabel}>
        Chain ID
        <input
          required
          list="chainIds"
          className={styles.didInputValue}
          name="chainId"
          value={chainId}
          onChange={handleInput}
        />
        <datalist id="chainIds">
          {Object.values(openSeaChainIds).map((chainId) => (
            <option key={chainId} value={chainId} />
          ))}
        </datalist>
      </label>
      .
      <label className={styles.didInputLabel}>
        Token Standard
        <input
          required
          list="standards"
          className={styles.didInputValue}
          name="assetNamespace"
          value={assetNamespace}
          onChange={handleInput}
        />
        <datalist id="standards">
          <option value="erc721" />
          <option value="erc1155" />
        </datalist>
      </label>
      :
      <label className={styles.didInputLabel}>
        Contract Address
        <input
          required
          className={styles.didInputValue}
          name="assetReference"
          value={assetReference}
          onChange={handleInput}
        />
      </label>
      :
      <label className={styles.didInputLabel}>
        <p className={styles.tokenID}>
          <span>Token ID</span>{' '}
          <span className={styles.optional}>(Optional)</span>
        </p>
        <input
          className={styles.didInputValue}
          name="assetInstance"
          value={assetInstance}
          onChange={handleInput}
        />
      </label>
    </section>
  );
}

const initialValues: AssetDidElements = {
  chainId: '',
  assetNamespace: '',
  assetReference: '',
  assetInstance: '',
};

export function AssetDid() {
  const [didInput, setDidInput] = useState<AssetDidElements>(initialValues);
  const { chainId, assetNamespace, assetReference } = didInput;

  const [assetDidUri, setAssetDidUri] = useState<AssetDidUri>();

  const openSeaUrl = assetDidUri && getOpenSeaUrl(assetDidUri);

  const error = useBooleanState();

  const reset = useCallback(() => {
    error.off();
    setDidInput(initialValues);
    setAssetDidUri(undefined);
  }, [error]);

  const handleDidInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      error.off();
      setAssetDidUri(undefined);

      const key = event.currentTarget.name;
      const value = event.currentTarget.value;

      if (key in didInput) {
        setDidInput({
          ...didInput,
          [key]: value,
        });
      }
    },
    [didInput, error],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      error.off();
      setAssetDidUri(undefined);

      const { chainId, assetNamespace, assetReference, assetInstance } =
        didInput;

      const string = assetInstance
        ? `did:asset:${chainId}.${assetNamespace}:${assetReference}:${assetInstance}`
        : `did:asset:${chainId}.${assetNamespace}:${assetReference}`;

      if (isAssetDidUri(string)) {
        setAssetDidUri(string);
      } else {
        error.on();
      }
    },
    [didInput, error],
  );

  return (
    <section className={styles.container}>
      <h1>Asset DIDs and Public Credentials</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <BuildDid prefillDidInput={setDidInput} reset={reset} />

        <DidInput handleInput={handleDidInput} initialValues={didInput} />

        <button
          className={styles.submit}
          disabled={!chainId || !assetNamespace || !assetReference}
          type="submit"
        >
          Continue
        </button>

        <output className={styles.output}>
          {error.current && <p className={styles.error}>Invalid input</p>}

          {!error.current && assetDidUri && (
            <Fragment>
              <dl className={styles.assetDidUri}>
                <dt>Asset DID:</dt>
                <dd className={styles.assetDidUriValue}>{assetDidUri}</dd>
              </dl>

              {openSeaUrl && (
                <a target="_blank" rel="noreferrer" href={openSeaUrl}>
                  Is this your NFT?
                </a>
              )}
            </Fragment>
          )}
        </output>
      </form>

      {!error.current && assetDidUri && (
        <PublicCredentials assetDidUri={assetDidUri} />
      )}
    </section>
  );
}
