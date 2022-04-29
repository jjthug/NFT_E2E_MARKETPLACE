const { ethers, upgrades } = require("hardhat");

async function main() {

  /**************************************************************************************************************** */

  /* NOTE! This creates a private collection where only the owner can create NFTs in the collection */
  const FACTORY_ADDRESS = "0x799a7E7627B9A02c7422Ac61Eb27dfE647Cc5219";
  const NAME = "";
  const SYMBOL = "";

  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const timestampBefore = blockBefore.timestamp;
  const SALT = timestampBefore;

/**************************************************************************************************************** */
    let CD = await ethers.getContractFactory("contracts/ERC1155AssetFactory/ERC1155MoviecoinFactoryC2.sol:ERC1155MoviecoinFactoryC2");
    const factory = await CD.attach(FACTORY_ADDRESS);
    await factory.deployed();

    let tx = await factory['createToken(string,string,string,string,address[],uint256)'](NAME, SYMBOL, "", "", [], SALT);
    let res = await tx.wait();
    for (const event of res.events) {
        if(event.event =="Create1155MoviecoinUserProxy") {
            collectionProxyAddress = event.args[0];
            console.log("Collection proxy deployed to = ", collectionProxyAddress);
            break;
        }
    }
/**************************************************************************************************************** */

}


//0x2396da4a00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000012ab59b03b18df0a200323419d13a341b878c52500000000000000000000000060af776251c277717d4e1ebdb7c48a1cae4f0a1800000000000000000000000000000000000000000000000000000000000000174d6f766965636f696e20436f6c6c656374696f6e20763300000000000000000000000000000000000000000000000000000000000000000000000000000000064d56432076330000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });