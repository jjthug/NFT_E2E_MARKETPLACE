const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {

  /******************************************************************************/

    let CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    const asset = await CD.deploy();
    await asset.deployed();
    console.log("asset Deployed to : ", asset.address);

    CD = await ethers.getContractFactory("contracts/BEACON/ERC1155MVCBeacon.sol:ERC1155MoviecoinBeacon");
    const beacon = await CD.attach("0xc0844Ff94C7C6f64DA5A838Da149026443fc3D58");
    await beacon.upgradeTo(asset.address);

    //0xa0d792C751de9a5987a1E6993051934981aBD9f7 - works

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });