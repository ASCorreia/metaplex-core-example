use anchor_lang::prelude::*;

use mpl_core::{
    instructions::CreateV1CpiBuilder, 
    types::{
        Attribute, 
        Attributes, 
        DataState, 
        PluginAuthorityPair
    }
};

#[derive(Accounts)]
pub struct MintAsset<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is the mint account of the asset to be minted
    #[account(mut)]
    pub mint: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is the ID of the Metaplex Core program
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl<'info> MintAsset<'info> {
    pub fn mint_core_asset(&mut self) -> Result<()> {
        CreateV1CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.mint.to_account_info())
            .collection(None)
            .authority(Some(&self.user.to_account_info()))
            .payer(&self.user.to_account_info())
            .owner(Some(&self.user.to_account_info()))
            .update_authority(None)
            .system_program(&self.system_program.to_account_info())
            .data_state(DataState::AccountState)
            .name("My Asset".to_string())
            .uri("https://myasset.com".to_string())
            .plugins(vec![PluginAuthorityPair {
                plugin: mpl_core::types::Plugin::Attributes(Attributes { attribute_list: 
                    vec![
                        Attribute { 
                            key: "Ledger".to_string(), 
                            value: "Vault".to_string() 
                        }
                    ]
                }), 
                authority: None
            }])
            .invoke()?;
        
        Ok(())
    }
}