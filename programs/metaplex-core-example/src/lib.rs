use anchor_lang::prelude::*;

declare_id!("Ef14SHa8TGNPKJZ6wShhxwrsWK2sQWH1jiCcjY2AuDuv");

mod instructions;
use instructions::*;

#[program]
pub mod metaplex_core_example {
    use super::*;

    pub fn mint_asset(ctx: Context<MintAsset>) -> Result<()> {
        ctx.accounts.mint_core_asset()
    }
}
