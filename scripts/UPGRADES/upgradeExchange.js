const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
let admin_proxy_abi = require('./ADMIN_PROXY_ABI/proxy_abi.json');

async function main() {

/******************************************************************************/
  
    const EXCHANGE_PROXY_ADDRESS = "0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e";
    let NEW_EXCHANGE_ADDRESS = "";
    // ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103" => (bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1))
    const ADMIN_STORAGE_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
    
/******************************************************************************* */

    // Deploy new exchange
    CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    const exchange = await CD.deploy();
    await exchange.deployed();
    console.log("new exchange Deployed to : ", exchange.address);
    NEW_EXCHANGE_ADDRESS = exchange.address;


    let val = await provider.getStorageAt(EXCHANGE_PROXY_ADDRESS, ADMIN_STORAGE_SLOT);
    const ADMIN_PROXY_ADDRESS = ethers.utils.hexlify(ethers.utils.stripZeros(val));
    console.log("admin proxy address =",ADMIN_PROXY_ADDRESS);


    console.log('Upgrading Exchange...');
    const proxyAdmin = await ethers.getContractAt(admin_proxy_abi, ADMIN_PROXY_ADDRESS);
    await proxyAdmin.upgrade(EXCHANGE_PROXY_ADDRESS,NEW_EXCHANGE_ADDRESS);
    console.log('Exchange upgraded');

/******************************************************************************* */

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });