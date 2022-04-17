const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /******************************************************************************/

    const CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");


  /******************************************************************************/
    // const cd = await CD.attach("0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e");
    const cd = await CD.deploy("US Dollar Coin", "USDC", "10000000000000000000000000");
    await cd.deployed();
    console.log("Deployed to : ", cd.address);
    
    // let data = await cd.getData("Mcoin","MVC","","");
    // console.log("data =", data);
    /******************************************************************************/
    

    // Non deploy functions

    /******************************************************************************/


    // await cd.deployed();

    /* ERC20 Proxy initialization */
    // await cd.__ERC20TransferProxy_init();

    /******************************************************************************/

  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


