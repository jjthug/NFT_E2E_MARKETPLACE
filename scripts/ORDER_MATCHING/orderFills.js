const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /********************************************************************/
    let CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    let exchange = await CD.attach("0x951EED6F11243835A1E5133CE3026CbBCBbe0869");

    let orderHash = "0xcc42b2382abe651086edaf0f5bcc994b2997579cbdd2a46fa19095637be870fd";
    let fills = await exchange.fills(orderHash);
    console.log("fills=",fills.toNumber());

  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });