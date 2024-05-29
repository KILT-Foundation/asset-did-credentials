# asset-did-credentials

This projects allows you to **create public credentials** by solely interacting with the user interface and your wallet(s).

It consist only of a very simple frontend.
It deems as proof of concept and outline for you to develop your project.
The public credentials issue through here do appear on the blockchain specified by the environment.

[Public Credentials](https://docs.kilt.io/docs/concepts/credentials/public-credentials) are on-chain Credentials for [Asset DIDs](https://docs.kilt.io/docs/concepts/asset-dids); ergo the projects name.

## Start the project locally

1. [Clone the repository ](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
2. Install the dependencies running `yarn install`
3. Make a environment file `.env` on the root directory
4. Assign a value for the variable `CHAIN_ENDPOINT`.
   For example `CHAIN_ENDPOINT=wss://peregrine.kilt.io` to interact with the KILT Testnet aliased _Peregrine_.
5. Start the project running `yarn dev`
6. Visit http://localhost:1234/ on any browser on your machine.
   Happens mostly automatically.
