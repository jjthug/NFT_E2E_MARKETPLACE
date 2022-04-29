const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {

  /******************************************************************************/
    const BEACON_ADDRESS ="0xc0844Ff94C7C6f64DA5A838Da149026443fc3D58";
    
    let CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    const asset = await CD.deploy();
    await asset.deployed();
    console.log("asset Deployed to : ", asset.address);

    CD = await ethers.getContractFactory("contracts/BEACON/ERC1155MVCBeacon.sol:ERC1155MoviecoinBeacon");
    const beacon = await CD.attach(BEACON_ADDRESS);
    await beacon.upgradeTo(asset.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });