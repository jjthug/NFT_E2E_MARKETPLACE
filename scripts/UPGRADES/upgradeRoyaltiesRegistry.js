const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
let admin_proxy_abi = require('./ADMIN_PROXY_ABI/proxy_abi.json');

async function main() {


/******************************************************************************/

    const ROYALTIES_PROXY_ADDRESS = "0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e";
    let NEW_ROYALTIESREG_ADDRESS = "";
    // ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103" => (bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1))
    const ADMIN_STORAGE_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

/******************************************************************************* */

    // Deploy new exchange
    CD = await ethers.getContractFactory("contracts/RoyaltiesRegistry/RoyaltiesRegistry.sol:RoyaltiesRegistry");
    const royaltiesReg = await CD.deploy();
    await royaltiesReg.deployed();
    console.log("new royaltiesReg Deployed to : ", royaltiesReg.address);
    NEW_ROYALTIESREG_ADDRESS = royaltiesReg.address;


    let val = await ethers.provider.getStorageAt(ROYALTIES_PROXY_ADDRESS, ADMIN_STORAGE_SLOT);
    let ADMIN_PROXY_ADDRESS = ethers.utils.hexlify(ethers.utils.stripZeros(val));
    console.log("admin address =",ADMIN_PROXY_ADDRESS);


    console.log('Upgrading Royalties_Registry...');
    const proxyAdmin = await ethers.getContractAt(admin_proxy_abi, ADMIN_PROXY_ADDRESS);
    await proxyAdmin.upgrade(ROYALTIES_PROXY_ADDRESS,NEW_ROYALTIESREG_ADDRESS);
    console.log('Royalties_Registry upgraded');

/******************************************************************************* */

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });