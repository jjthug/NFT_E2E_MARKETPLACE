const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /******************************************************************************/


    const CD = await ethers.getContractFactory("ERC1155Moviecoin");
    const asset = await CD.deploy();

    CD = await ethers.getContractFactory("ERC1155MoviecoinBeacon");
    const beacon = await CD.deploy(asset.address);

    CD = await ethers.getContractFactory("ERC1155LazyMintTransferProxy");
    const lazyTransferProxy = await CD.deploy();

    CD = await ethers.getContractFactory("NftTransferProxy");   
    const nftTransferProxy = await CD.deploy();

    CD = await ethers.getContractFactory("ERC1155MoviecoinFactoryC2");
    const factory = await CD.deploy(beacon, nftTransferProxy, lazyTransferProxy);

    CD = await ethers.getContractFactory("ERC20TransferProxy");
    const erc20TransferProxy = await CD.deploy();

    CD = await ethers.getContractFactory("RoyaltiesRegistry");
    const royaltiesRegistry = await upgrades.deployProxy(CD, [], {initializer:"__RoyaltiesRegistry_init"});

    CD = await ethers.getContractFactory("ExchangeV2");
    const exchange = await upgrades.deployProxy(CD, [,"0x60aF776251c277717d4E1eBDB7C48A1cae4f0a18","0xb35848fFdF52e69dF9CE5c3e4eD141Aae6d08C25",0,"0x23F7F82Eb917A49a722E970580Ee138Af5f71D74","0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e"], {initializer:"__ExchangeV2_init"});

        
    // const CD = await ethers.getContractFactory("MVCTestFactory");

  /******************************************************************************/
    

    /* ERC1155Moviecoin */
    // const cd = await CD.deploy();
    // const cd = await CD.attach("0x4adCD7e6b0ED6D2F30c7E2C2fa0A262C750353c4");
    // await cd._setMovieProducer("00","0x60C1F061B4fd365389dEFa3596FfFC8749D83b3B")

    /* ERC1155MoviecoinBeacon */
    // const cd = await CD.deploy("0x23d36343fa9Bcd60FC313FEB358865BEe7EB70fB");

    /* ERC1155LazyMintTransferProxy */
    // const cd = await CD.deploy();

    /* NftTransferProxy */
    // const cd = await CD.deploy();

    /* ERC1155MVCFactoryC2 */
    // const cd = await CD.deploy("0xc0844Ff94C7C6f64DA5A838Da149026443fc3D58", "0x12ab59b03B18df0A200323419D13A341B878c525", "0x60aF776251c277717d4E1eBDB7C48A1cae4f0a18");
    
    /* ERC20 Transfer Proxy */
    // const cd = await CD.deploy();
    
    /* Royalties Registry */
    // const cd = await upgrades.deployProxy(CD, [], {initializer:"__RoyaltiesRegistry_init"});
    //  await upgrades.upgradeProxy("0x12ab59b03B18df0A200323419D13A341B878c525",CD);
    //  console.log("upgraded");
    
    /* Exchange */
    // const cd = await upgrades.deployProxy(CD, ["0x12ab59b03B18df0A200323419D13A341B878c525","0x60aF776251c277717d4E1eBDB7C48A1cae4f0a18","0xb35848fFdF52e69dF9CE5c3e4eD141Aae6d08C25",0,"0x23F7F82Eb917A49a722E970580Ee138Af5f71D74","0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e"], {initializer:"__ExchangeV2_init"});
    // await upgrades.upgradeProxy("0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e",CD);
    //  console.log("upgraded");

    /******************************************************************************/
    

  // Non deploy functions

    /******************************************************************************/


    await asset.deployed();
    console.log("asset Deployed to : ", asset.address);

    await beacon.deployed();
    console.log("beacon Deployed to : ", beacon.address);

    await lazyTransferProxy.deployed();
    console.log("lazyTransferProxy Deployed to : ", lazyTransferProxy.address);

    await nftTransferProxy.deployed();
    console.log("nftTransferProxy Deployed to : ", nftTransferProxy.address);

    await factory.deployed();
    console.log("factory Deployed to : ", factory.address);

    await erc20TransferProxy.deployed();
    console.log("erc20TransferProxy Deployed to : ", erc20TransferProxy.address);

    await royaltiesRegistry.deployed();
    console.log("royaltiesRegistry Deployed to : ", royaltiesRegistry.address);

    await exchange.deployed();
    console.log("exchange Deployed to : ", exchange.address);

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