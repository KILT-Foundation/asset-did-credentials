export {};
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
    kilt: {
      sporran: {
        signExtrinsicWithDid(
          extrinsic: string,
          signer: string,
        ): Promise<{ signed: string; didKeyUri: string }>;
      };
    };
  }
}
