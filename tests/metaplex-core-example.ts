import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MetaplexCoreExample } from "../target/types/metaplex_core_example";

import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createPluginV2, createV1, transferV1, fetchAssetV1, mplCore, pluginAuthority, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { base58, createSignerFromKeypair, generateSigner, signerIdentity, sol } from "@metaplex-foundation/umi";
import { Keypair, PublicKey } from "@solana/web3.js";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

const umi = createUmi("http://127.0.0.1:8899").use(mplCore());

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

const asset = generateSigner(umi);

describe("metaplex-core-example", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MetaplexCoreExample as Program<MetaplexCoreExample>;

  it("Request Airdrop", async () => {
    let airdrop1 = await umi.rpc.airdrop(keypair.publicKey, sol(10));
    console.log(airdrop1);
  });

  it("Create an Asset", async () => {
    const result = await createV1(umi, {
      asset: asset,
      name: 'My Nft',
      uri: 'https://example.com/my-nft',
      plugins: [
        {
          plugin: createPluginV2({
            type: 'Attributes',
            attributeList: [{ key: 'Ledger', value: 'Flex' }],
          }),
          authority: pluginAuthority('UpdateAuthority'),
        },
      ],
    }).sendAndConfirm(umi);

    console.log("\nAsset minted. Transaction signature: ", base58.deserialize(result.signature)[0])
  });

  it("Fetch an Asset", async () => {
    const fetchedAsset = await fetchAssetV1(umi, asset.publicKey)

    console.log("\nAsset fetched:\n", fetchedAsset)
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("\nYour transaction signature", tx);
  });

  it("Mint Core Asset", async () => {
    const asset = Keypair.generate();

    console.log("\nAsset address: ", asset.publicKey.toBase58());

    const tx = await program.methods.mintAsset()
      .accountsPartial({
        user: provider.publicKey,
        mint: asset.publicKey,
        systemProgram: SYSTEM_PROGRAM_ID,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([asset])
      .rpc();

    console.log("\nYour transaction signature", tx);
  });
});
