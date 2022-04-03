# NFT MARKETPLACE

This project contains the smart contract to deploying an end-to-end NFT Marketplace based on Rarible protocol.

All the contracts required for deployment are in the **contracts store** folder
When deploying a set of contracts copy from this folder to the contracts folder in order to deploy through hardhat.

## Order of deployment

1. ERC20 Transfer Proxy
2. NFT Transfer Proxy
3. Lazy Transfer Proxy
4. ERC1155 Asset
5. Beacon
6. ERC1155 Asset Factory

These set of contracts will setup the NFT Factory contracts, which can be used to create collections and lazy mint (offchain listing) tokens in these collections.

7. External Royalties deployed as an upgradeable contract
8. Exchange deployed as an upgradeable contract