import {
  ChangeEvent,
  Dispatch,
  Fragment,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { parse } from '@kiltprotocol/asset-did';

import * as styles from './BuildDid.module.css';

import { useBooleanState } from '../../utilities/useBooleanState';
import { isAssetDidUri } from '../../utilities/isAssetDidUri';
import { isOpenSeaUrl, parseOpenSeaUrl } from '../../utilities/openSea';
import { AssetDidElements } from '../AssetDid/AssetDid';

const API_KEY = '9b63fb73-58f2-4a21-9169-7c95ddf916a2';

interface NFT {
  contract_address: string;
  token_id: string;
  name?: string;
  cached_file_url?: string;
}

type SupportedMetaMaskChainId = '0x1' | '0x5' | '0x89';
type SupportedCaip2ChainId = 'eip155:1' | 'eip155:5' | 'eip155:137';
type SupportedApiChainId = 'ethereum' | 'goerli' | 'polygon';

const supportedCaip2Chains: Record<
  SupportedMetaMaskChainId,
  SupportedCaip2ChainId
> = {
  '0x1': 'eip155:1',
  '0x5': 'eip155:5',
  '0x89': 'eip155:137',
};

const supportedApiChains: Record<SupportedCaip2ChainId, SupportedApiChainId> = {
  'eip155:1': 'ethereum',
  'eip155:5': 'goerli',
  'eip155:137': 'polygon',
};

function isSupportedChain(
  chainId: string,
): chainId is SupportedMetaMaskChainId {
  return ['0x1', '0x5', '0x89'].includes(chainId);
}

function useMetamask(reset: () => void) {
  const hasMetaMask = useBooleanState();

  const [chainId, setChainId] = useState<SupportedCaip2ChainId>();
  const [account, setAccount] = useState<string>();

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length === 0) {
        return;
      }
      reset();
      setAccount(accounts[0]);
    },
    [reset, setAccount],
  );

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) {
      return;
    }

    ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    (async () => {
      const chainId = (await ethereum.request({
        method: 'eth_chainId',
      })) as string;

      if (!isSupportedChain(chainId)) {
        return;
      }

      setChainId(supportedCaip2Chains[chainId]);
      hasMetaMask.on();
      ethereum.on('accountsChanged', handleAccountsChanged);
    })();
  }, [hasMetaMask, handleAccountsChanged]);

  const handleConnect = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault();
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        handleAccountsChanged(accounts);
      } catch (error) {
        console.error(error);
      }
    },
    [handleAccountsChanged],
  );

  return { hasMetaMask, chainId, account, handleConnect };
}

function NFTSelect({
  account,
  chainId,
  reset,
  prefillDidInput,
}: {
  account: string;
  chainId: SupportedCaip2ChainId;
  reset: () => void;
  prefillDidInput: Dispatch<SetStateAction<AssetDidElements>>;
}) {
  const [NFTs, setNFTs] = useState<NFT[]>();

  useEffect(() => {
    (async () => {
      try {
        const chain = supportedApiChains[chainId];
        const url = new URL(`https://api.nftport.xyz/v0/accounts/${account}`);
        url.searchParams.set('chain', chain);
        url.searchParams.set('include', 'metadata');
        url.searchParams.set('page_size', '5');
        const { response, nfts } = await (
          await fetch(url, {
            headers: { Authorization: API_KEY },
          })
        ).json();

        if (response === 'NOK') throw new Error('API error');
        setNFTs(nfts);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [account, chainId]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!chainId || !NFTs || NFTs.length === 0) {
      return;
    }
    reset();
    const { contract_address, token_id } = NFTs[selectedIndex];
    prefillDidInput({
      chainId,
      /** We could make an API request for each contract to check if the standard is erc721 or erc1155, but for demo purposes we assume erc721 */
      assetNamespace: 'erc721',
      assetReference: contract_address,
      assetInstance: token_id,
    });
  }, [selectedIndex, chainId, NFTs, reset, prefillDidInput]);

  return (
    <section>
      {account && NFTs?.length === 0 && (
        <p className={styles.error}>
          No assets found. Please try another account or enter the asset data
          manually. See{' '}
          <a
            href="https://github.com/KILTprotocol/spec-asset-did#asset-decentralized-identifiers-did-method-specification"
            target="_blank"
            rel="noreferrer"
          >
            specification
          </a>{' '}
          for details.
        </p>
      )}

      {NFTs && NFTs?.length > 0 && (
        <Fragment>
          <h2 className={styles.nftListHeading}>Select NFT</h2>
          <ul className={styles.nftList}>
            {NFTs.map(
              (
                { contract_address, token_id, name, cached_file_url },
                index,
              ) => (
                <li key={`${contract_address}:${token_id}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={
                      index === selectedIndex ? styles.selected : styles.select
                    }
                  >
                    <figure className={styles.nft}>
                      <img
                        className={styles.nftImage}
                        src={cached_file_url}
                        alt={name}
                      />
                      <figcaption className={styles.nftName}>{name}</figcaption>
                    </figure>
                  </button>
                </li>
              ),
            )}
          </ul>
        </Fragment>
      )}
    </section>
  );
}

export function BuildDid({
  prefillDidInput,
  reset,
}: {
  prefillDidInput: Dispatch<SetStateAction<AssetDidElements>>;
  reset: () => void;
}) {
  const { hasMetaMask, chainId, account, handleConnect } = useMetamask(reset);

  const urlInputError = useBooleanState();

  const handleUrlInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      urlInputError.off();
      reset();

      const input = event.currentTarget.value;
      if (!input) {
        return;
      }

      if (isAssetDidUri(input)) {
        const { chainId, assetNamespace, assetReference, assetInstance } =
          parse(input);
        prefillDidInput({
          chainId,
          assetNamespace,
          assetReference,
          assetInstance: assetInstance || '',
        });
        return;
      }

      if (isOpenSeaUrl(input)) {
        prefillDidInput(parseOpenSeaUrl(input));
        return;
      }

      urlInputError.on();
    },
    [urlInputError, reset, prefillDidInput],
  );

  return (
    <Fragment>
      {!account && (
        <section className={styles.urlInput}>
          <button
            type="button"
            onClick={handleConnect}
            disabled={!hasMetaMask.current}
            className={styles.connect}
          >
            Connect to MetaMask
          </button>

          <p>OR</p>

          <label className={styles.urlInputLabel}>
            Enter OpenSea URL or Asset DID:
            <input className={styles.urlInputValue} onChange={handleUrlInput} />
          </label>

          {urlInputError.current && (
            <p className={styles.error}>
              Unable to parse URL. Please connect to MetaMask or enter the asset
              data manually. See{' '}
              <a
                href="https://github.com/KILTprotocol/spec-asset-did#asset-decentralized-identifiers-did-method-specification"
                target="_blank"
                rel="noreferrer"
              >
                specification
              </a>{' '}
              for details.
            </p>
          )}
        </section>
      )}

      {account && chainId && (
        <NFTSelect
          account={account}
          chainId={chainId}
          reset={reset}
          prefillDidInput={prefillDidInput}
        />
      )}
    </Fragment>
  );
}
