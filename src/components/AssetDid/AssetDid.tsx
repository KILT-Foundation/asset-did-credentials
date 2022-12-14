import {
  ChangeEvent,
  FormEvent,
  Fragment,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { AssetDidUri } from '@kiltprotocol/types';

import { parse, validateUri } from '@kiltprotocol/asset-did';

import * as styles from './AssetDid.module.css';

import {
  getOpenSeaUrl,
  isOpenSeaUrl,
  openSeaChainIds,
  parseOpenSeaUrl,
} from '../../utilities/openSea';
import { useBooleanState } from '../../utilities/useBooleanState';
import { AssetDidActions } from '../AssetDidActions/AssetDidActions';

function isAssetDidUri(uri: string): uri is AssetDidUri {
  try {
    validateUri(uri);
    return true;
  } catch {
    return false;
  }
}

const initialValues = {
  chainId: '',
  assetNamespace: '',
  assetReference: '',
  assetInstance: '',
};

export function AssetDid() {
  const [assetDidInput, setAssetDidInput] = useState(initialValues);
  const { chainId, assetNamespace, assetReference, assetInstance } =
    assetDidInput;

  const [assetDidUri, setAssetDidUri] = useState<AssetDidUri>();

  const openSeaUrl = useMemo(() => {
    if (!assetDidUri || !assetInstance) {
      return;
    }
    return getOpenSeaUrl(assetDidUri);
  }, [assetDidUri, assetInstance]);

  const urlInputError = useBooleanState();
  const didInputError = useBooleanState();

  const handleUrlInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      urlInputError.off();
      didInputError.off();
      setAssetDidUri(undefined);

      const url = event.currentTarget.value;

      if (isAssetDidUri(url)) {
        const { chainId, assetNamespace, assetReference, assetInstance } =
          parse(url);
        setAssetDidInput({
          chainId,
          assetNamespace,
          assetReference,
          assetInstance: assetInstance || '',
        });
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
      setAssetDidUri(undefined);

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
      setAssetDidUri(undefined);

      const { chainId, assetNamespace, assetReference, assetInstance } =
        assetDidInput;

      const string = assetInstance
        ? `did:asset:${chainId}.${assetNamespace}:${assetReference}:${assetInstance}`
        : `did:asset:${chainId}.${assetNamespace}:${assetReference}`;

      if (isAssetDidUri(string)) {
        setAssetDidUri(string);
      } else {
        didInputError.on();
      }
    },
    [assetDidInput, didInputError],
  );

  const disabled = !chainId || !assetNamespace || !assetReference;

  return (
    <section className={styles.container}>
      <h1>Asset DID</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.urlInput}>
          <label className={styles.urlInputLabel}>
            OpenSea URL or Asset DID:
            <input className={styles.urlInputValue} onChange={handleUrlInput} />
          </label>
        </section>

        <section className={styles.didInput}>
          {urlInputError.current && (
            <p className={styles.urlError}>
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
          <label className={styles.didInputLabel}>
            Chain ID
            <input
              required
              list="chainIds"
              className={styles.didInputValue}
              name="chainId"
              value={chainId}
              onChange={handleDidInput}
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
              onChange={handleDidInput}
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
              onChange={handleDidInput}
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
              onChange={handleDidInput}
            />
          </label>
        </section>

        <button disabled={disabled} type="submit">
          Continue
        </button>

        <output className={styles.output}>
          {didInputError.current && (
            <p className={styles.error}>Invalid input</p>
          )}

          {!didInputError.current && assetDidUri && (
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

      {!didInputError.current && assetDidUri && (
        <AssetDidActions assetDidUri={assetDidUri} />
      )}
    </section>
  );
}
