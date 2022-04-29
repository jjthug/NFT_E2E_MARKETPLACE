const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
async function main() {

/******************************************************************************/
  
    let PROXY_ADDRESS = "0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e";
    // ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103" => (bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1))
    const ADMIN_STORAGE_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

/******************************************************************************* */

    let val = await ethers.provider.getStorageAt(PROXY_ADDRESS, ADMIN_STORAGE_SLOT);
    let add = ethers.utils.hexlify(ethers.utils.stripZeros(val));
    console.log("admin address =",add);

/******************************************************************************* */

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });