# Moviecoin NFT Marketplace

## Install dependencies

Run command:
```
npm i
```

## Contracts
1.	ERC1155 Asset: This is the contract that represents the NFT collection.
2.	Beacon: It contains the implementation address of the ERC1155 asset.
3.	Lazy NFT transfer proxy: The exchange calls this proxy to transfers the Lazy minted NFTs on behalf of seller (asset class = ERC1155_LAZY).
4.	NFT transfer proxy: The exchange calls this proxy to transfers the non-Lazy minted NFTs on behalf of seller (asset class = ERC1155).
5.	ERC20 transfer proxy: The exchange calls this proxy to transfers ERC20 on behalf of the buyer.
6.	ERC1155 Asset Factory: The factory contract is used for creating NFT collections.
7.	Royalties Registry: It will be used by exchange to get the royalties details for each collection.
8.	Exchange: Allows platform to let users trade NFTs (ERC721, ERC1155), ERC20 tokens, ETH. 

## The Process
1.	Seller lists NFTs for sale
2.	Buyer approves platform (erc20 transfer proxy) to transfer their funds (if applicable).
3.	If approved buyer can buy NFTs on the platform.

## Order Matching

- Direct buy
    - Seller must create sell order and sell Signature
    - Buyer will create buy Order, no need for buy Signature, as the buyer is executing the transaction.
- Bids (Timed and non-timed)
    - Bidders will create buy Order and buy Signature and submit to the platform. They can decide how long the bid should be valid for, by setting the end Time in the order.
    - Seller can choose to accept it or not, before the end Time of the bid order.
    - If seller accepts it, they should create corresponding sell Order, no need for sell Signature.
- Auction
    - Seller initiates auction on platform
    - Bidders can create timed or non-timed buyOrders.
    - At the end of auction, the highest bid will be shown to seller, who can then choose to accept it or not.


## SCRIPTS

###  DEPLOY MARKETPLACE

1.	ERC1155 Asset contract
2.	Beacon contract initialized with the implementation as ERC1155 Asset contract (1.)
3.	Lazy NFT transfer proxy
4.	NFT transfer proxy
5.	ERc20 transfer proxy
6.	ERC1155 Factory: initialize with beacon (2.), lazy transfer proxy (2.)  and Nft transfer proxy (4.)
7.	Upgradeable Royalties registry 
8.	Upgradeable exchange
9.	Beacon proxy to Moviecoin collection Upgradable:
    a.	Create this private collection using factory (6.)


```
npx hardhat run --network mumbai scripts/DEPLOY_FULL/deployAll.js
```

### Check Admin Proxy
``` 
    npx hardhat run --network mumbai scripts/UPGRADES/GET_ADMIN_PROXY/checkAdmin.js
```

### UPGRADES

To upgrade ERC1155 Asset contract
```
    npx hardhat run --network mumbai scripts/UPGRADES/upgradeERC1155Asset.js
```

To upgrade Exchange contract
```
    npx hardhat run --network mumbai scripts/UPGRADES/upgradeExchange.js
```

To upgrade Royalties Registry contract
```
    npx hardhat run --network mumbai scripts/UPGRADES/upgradeRoyaltiesRegistry.js
```

### CREATE NEW PRIVATE COLLECTION

To create a new private collection (only owner can create NFTs in the private collection)
```
    npx hardhat run --network mumbai scripts/CREATE_COLLECTION/createPrivateCollection.js
```


To create a new open collection (any user can create NFTs in the open collection)

```
    npx hardhat run --network mumbai scripts/CREATE_COLLECTION/createOpenCollection.js
```


### USDT ERC20 TOKEN

```   
    npx hardhat run --network mumbai scripts/TOKEN/token.js
```

### Testnet Tests
Create the .env files with the required account private keys and node URLs.
Also update the test path in hardhat.config.
Tests can be run on Polygon Mumbai or Rinkeby testnets using the command:

```
npx hardhat test --network [NETWORK_NAME from hardhat.config]
```