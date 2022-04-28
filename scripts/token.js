const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /******************************************************************************/
  let CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");
  token = await CD.attach("0x1B4581B71A642c551830E6B5B1F319aA6427009E");
  let bal = await token.balanceOf("0x8218Af9ea6B3F9FC6d3987aC9755bD96eF2534d3");
  console.log("bal=",bal);
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });