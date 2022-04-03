const hre = require("hardhat");

async function main() {

    const CD = await hre.ethers.getContractFactory("ERC1155Rarible");
    // const CD = await hre.ethers.getContractFactory("ERC1155RaribleBeacon");
    // const CD = await hre.ethers.getContractFactory("ERC1155RaribleFactoryC2");
    // const CD = await hre.ethers.getContractFactory("MVCTestFactory");

    
    // const cd = await CD.deploy();
    // const cd = await CD.deploy("0x8C82Fe244A29c9383EF56cc2D38cB00bD47027CA");
    // const cd = await CD.deploy("0x177283e35007Efb7a0F069E506882d3d2491df85", "0x23F7F82Eb917A49a722E970580Ee138Af5f71D74", "0x23F7F82Eb917A49a722E970580Ee138Af5f71D74");
    // const cd = await CD.deploy("0x177283e35007Efb7a0F069E506882d3d2491df85", "0x23F7F82Eb917A49a722E970580Ee138Af5f71D74", "0x23F7F82Eb917A49a722E970580Ee138Af5f71D74");

    // const cd = await CD.attach("0x798614ebdcd31b8d86e1e7e217e58fb19e278815");
    const cd = await CD.attach("0xaf1C97D471FF0711afA64aFe93F99D63685e699e");

    
    await cd._setMovieProducer("1", "0x23F7F82Eb917A49a722E970580Ee138Af5f71D74")
    // const cd = await CD.deploy();


    // await cd.deployed();
    // console.log("Deployed to : ", cd.address);

    //ERC1155Rarible, ERC1155RaribleBeacon, ERC1155RaribleFactoryC2, TestFactory
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });