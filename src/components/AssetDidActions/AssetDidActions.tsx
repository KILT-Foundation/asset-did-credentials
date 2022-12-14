import {
  DidDidDetailsDidAuthorizedCallOperation,
  DidDidDetailsDidSignature,
} from '@kiltprotocol/augment-api';
import { Blockchain } from '@kiltprotocol/chain-helpers';
import { CType, PublicCredential } from '@kiltprotocol/core';
import { AssetDidUri, IAssetClaim } from '@kiltprotocol/types';
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp';
import { GenericExtrinsic } from '@polkadot/types';
import { find } from 'lodash-es';
import { FormEvent, Fragment, useCallback, useEffect, useState } from 'react';

import * as styles from './AssetDidActions.module.css';

import { getApi } from '../../utilities/api';
import { emailCType } from '../../utilities/cTypes';
import { getSubscanHost } from '../../utilities/subscanHost';

type InjectedAccount = Awaited<ReturnType<typeof web3Accounts>>[number];

function Publish({ assetDidUri }: { assetDidUri: AssetDidUri }) {
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const [paymentAccount, setPaymentAccount] = useState<InjectedAccount>();

  const [email, setEmail] = useState('');

  const [subscanUrl, setSubscanUrl] = useState('');

  const [status, setStatus] = useState<
    'none' | 'processing' | 'success' | 'error'
  >('none');

  useEffect(() => {
    (async () => {
      const api = await getApi();
      const genesisHash = api.genesisHash.toHex();
      await web3Enable('Asset DIDs');
      const allAccounts = await web3Accounts();
      const kiltAccounts = allAccounts.filter(
        (account) =>
          !account.meta.genesisHash || account.meta.genesisHash === genesisHash,
      );
      setAccounts(kiltAccounts);
      setPaymentAccount(kiltAccounts[0]);
    })();
  }, []);

  const handleAccountSelect = useCallback(
    (event: FormEvent<HTMLSelectElement>) => {
      const address = event.currentTarget.value;

      setPaymentAccount(find(accounts, { address }));
    },
    [accounts],
  );

  const handleEmailInput = useCallback((event: FormEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!paymentAccount) {
        return;
      }
      setStatus('none');
      setSubscanUrl('');

      try {
        const api = await getApi();

        const claim: IAssetClaim = {
          cTypeHash: CType.idToChain(emailCType.$id),
          contents: { Email: email },
          subject: assetDidUri,
        };

        const credential = PublicCredential.fromClaim(claim);

        const addPublicCredential = api.tx.publicCredentials.add(
          PublicCredential.toChain(credential),
        );

        const { signed } = await window.kilt.sporran.signExtrinsicWithDid(
          addPublicCredential.toHex(),
          paymentAccount.address,
        );

        const extrinsic = api.createType('Extrinsic', signed);

        const [addKey, publish, removeKey] = extrinsic
          .args[0] as unknown as GenericExtrinsic[];

        const addKeyCall = api.tx.did.submitDidCall(
          addKey.args[0] as unknown as DidDidDetailsDidAuthorizedCallOperation,
          addKey.args[1] as unknown as DidDidDetailsDidSignature,
        );

        const publishCall = api.tx.did.submitDidCall(
          publish.args[0] as unknown as DidDidDetailsDidAuthorizedCallOperation,
          publish.args[1] as unknown as DidDidDetailsDidSignature,
        );

        const removeKeyCall = api.tx.did.submitDidCall(
          removeKey
            .args[0] as unknown as DidDidDetailsDidAuthorizedCallOperation,
          removeKey.args[1] as unknown as DidDidDetailsDidSignature,
        );

        const batch = api.tx.utility.batchAll([
          addKeyCall,
          publishCall,
          removeKeyCall,
        ]);

        const { signer } = await web3FromAddress(paymentAccount.address);

        const signedTx = await batch.signAsync(paymentAccount.address, {
          signer,
        });

        setStatus('processing');

        await Blockchain.submitSignedTx(signedTx);

        setStatus('success');

        const txHash = signedTx.hash.toHex();
        const subscanHost = getSubscanHost();
        setSubscanUrl(`${subscanHost}/extrinsic/${txHash}`);
      } catch (error) {
        setStatus('error');
        console.error(error);
      }
    },
    [assetDidUri, paymentAccount, email],
  );
  return (
    <form onSubmit={handleSubmit} className={styles.publish}>
      <label className={styles.publishLabel}>
        Asset DID:
        <input readOnly value={assetDidUri} className={styles.publishInput} />
      </label>

      <label className={styles.publishLabel}>
        Email:
        <input
          required
          type="email"
          onChange={handleEmailInput}
          className={styles.publishInput}
        />
      </label>

      <label className={styles.publishLabel}>
        Choose payment account:
        <select onInput={handleAccountSelect} className={styles.publishInput}>
          {accounts?.map(({ address, meta: { name, source } }) => (
            <option key={address} value={address}>{`${
              name || address
            } (${source})`}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={status === 'processing'}
        className={styles.submit}
      >
        Publish
      </button>

      {status !== 'none' && (
        <output className={styles.statusContainer}>
          {status === 'processing' && <p>Processing...</p>}

          {status === 'success' && (
            <Fragment>
              <p>Success ✅</p>
              {subscanUrl && (
                <p>
                  <a href={subscanUrl} target="_blank" rel="noreferrer">
                    View blockchain transaction on Subscan
                  </a>
                </p>
              )}
            </Fragment>
          )}

          {status === 'error' && <p>Error ❌</p>}
        </output>
      )}
    </form>
  );
}

export function AssetDidActions({
  assetDidUri,
}: {
  assetDidUri: AssetDidUri;
}): JSX.Element {
  const [action, setAction] = useState<'publish' | 'lookup'>('publish');

  return (
    <section className={styles.container}>
      <nav className={styles.actions}>
        <button
          className={action === 'publish' ? styles.active : styles.inactive}
          onClick={() => setAction('publish')}
        >
          Publish
        </button>
        <button
          className={action === 'lookup' ? styles.active : styles.inactive}
          onClick={() => setAction('lookup')}
        >
          Look up
        </button>
      </nav>

      {action === 'publish' && <Publish assetDidUri={assetDidUri} />}

      {/* TODO: https://kiltprotocol.atlassian.net/browse/SK-1523 */}
      {action === 'lookup' && <div />}
    </section>
  );
}
