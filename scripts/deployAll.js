const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {
  
  /******************************************************************************/

    let CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    const asset = await CD.deploy();
    await asset.deployed();
    console.log("asset Deployed to : ", asset.address);

    CD = await ethers.getContractFactory("contracts/BEACON/ERC1155MVCBeacon.sol:ERC1155MoviecoinBeacon");
    const beacon = await CD.deploy(asset.address);
    await beacon.deployed();
    console.log("beacon Deployed to : ", beacon.address);

    CD = await ethers.getContractFactory("contracts/LazyTransferProxy/ERC1155LazyMintTransferProxy.sol:ERC1155LazyMintTransferProxy");
    const lazyTransferProxy = await CD.deploy();
    await lazyTransferProxy.deployed();
    console.log("lazyTransferProxy Deployed to : ", lazyTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/NFTTransferProxy/TransferProxy.sol:NftTransferProxy");   
    const nftTransferProxy = await CD.deploy();
    await nftTransferProxy.deployed();
    console.log("nftTransferProxy Deployed to : ", nftTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/ERC1155AssetFactory/ERC1155MoviecoinFactoryC2.sol:ERC1155MoviecoinFactoryC2");
    const factory = await CD.deploy(beacon.address, nftTransferProxy.address, lazyTransferProxy.address);
    await factory.deployed();
    console.log("factory Deployed to : ", factory.address);

    CD = await ethers.getContractFactory("contracts/ERC20TransferProxy/ERC20TransferProxy.sol:ERC20TransferProxy");
    const erc20TransferProxy = await CD.deploy();
    await erc20TransferProxy.deployed();
    console.log("erc20TransferProxy Deployed to : ", erc20TransferProxy.address);

    CD = await ethers.getContractFactory("contracts/RoyaltiesRegistry/RoyaltiesRegistry.sol:RoyaltiesRegistry");
    const royaltiesRegistry = await upgrades.deployProxy(CD, [], {initializer:"__RoyaltiesRegistry_init"});
    await royaltiesRegistry.deployed();
    console.log("royaltiesRegistry Deployed to : ", royaltiesRegistry.address);

    CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    const exchange = await upgrades.deployProxy(CD, [nftTransferProxy.address,lazyTransferProxy.address,erc20TransferProxy.address,0,"0x23F7F82Eb917A49a722E970580Ee138Af5f71D74",royaltiesRegistry.address], {initializer:"__ExchangeV2_init"});
    await exchange.deployed();
    console.log("exchange Deployed to : ", exchange.address);


    // ----------------------------------------------------------------------------------------------------------------


    /* ERC20 Proxy initialization */
    // await cd.__ERC20TransferProxy_init();

    /* Royalties Registry initialization */
    // await cd.__RoyaltiesRegistry_init();
      

    /******************************************************************************/

  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });