const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {
  
  /******************************************************************************/
    [owner, addr1] = await ethers.getSigners();

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
    await lazyTransferProxy.__OperatorRole_init();

    CD = await ethers.getContractFactory("contracts/NFTTransferProxy/TransferProxy.sol:NftTransferProxy");   
    const nftTransferProxy = await CD.deploy();
    await nftTransferProxy.deployed();
    console.log("nftTransferProxy Deployed to : ", nftTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/ERC20TransferProxy/ERC20TransferProxy.sol:ERC20TransferProxy");
    const erc20TransferProxy = await CD.deploy();
    await erc20TransferProxy.deployed();
    console.log("erc20TransferProxy Deployed to : ", erc20TransferProxy.address);
    await erc20TransferProxy.__OperatorRole_init();

    CD = await ethers.getContractFactory("contracts/ERC1155AssetFactory/ERC1155MoviecoinFactoryC2.sol:ERC1155MoviecoinFactoryC2");
    const factory = await CD.deploy(beacon.address, nftTransferProxy.address, lazyTransferProxy.address);
    await factory.deployed();
    console.log("factory Deployed to : ", factory.address);
    let tx = await factory['createToken(string,string,string,string,address[],uint256)']("Moviecoin Collection", "MVC", "", "", [], 123456);
    let res = await tx.wait();
    for (const event of res.events) {
        if(event.event =="Create1155MoviecoinUserProxy") {
            console.log("Collection proxy deployed to = ", event.args[0]);
            break;
        }
    }

    CD = await ethers.getContractFactory("contracts/RoyaltiesRegistry/RoyaltiesRegistry.sol:RoyaltiesRegistry");
    const royaltiesRegistry = await upgrades.deployProxy(CD, [], {initializer:"__RoyaltiesRegistry_init"});
    await royaltiesRegistry.deployed();
    console.log("royaltiesRegistry Deployed to : ", royaltiesRegistry.address);

    CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    const exchange = await upgrades.deployProxy(CD, [nftTransferProxy.address,lazyTransferProxy.address,erc20TransferProxy.address,0,"0x23F7F82Eb917A49a722E970580Ee138Af5f71D74",royaltiesRegistry.address], {initializer:"__ExchangeV2_init"});
    await exchange.deployed();
    console.log("exchange Deployed to : ", exchange.address);

    /* OPTIONAL: required to deploy ERC20 token for testing on testnets if not already deployed */
    // CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");
    // token = await CD.deploy("US Dollar Coin", "USDC", "10000000000000000000000000");
    // await token.deployed();
    // console.log("token Deployed to : ", token.address);
    // await token.transfer(addr1.address, "100000000000000000000000");

    /* Adding exchange operator to lazy transfer proxy and erc20 proxy */
    await lazyTransferProxy.addOperator(exchange.address);
    await erc20TransferProxy.addOperator(exchange.address);

    /* Approve erc20 transfer proxy to use funds */
    // await token.connect(addr1).approve(erc20TransferProxy.address, "100000000000000000000000");

  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });