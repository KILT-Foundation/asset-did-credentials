export {};
declare global {
  interface Window {
    kilt: {
      sporran: {
        signExtrinsicWithDid(
          extrinsic: HexString,
          signer: string,
        ): Promise<{ signed: HexString; didKeyUri: string }>;
      };
    };
  }
}
