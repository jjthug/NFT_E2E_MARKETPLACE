const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /******************************************************************************/

    const CD = await ethers.getContractFactory("ERC1155Moviecoin");

  /******************************************************************************/
    const cd = await CD.attach("0x65fd28BB09215E6219c82f4E4d9faF2CA6024426");

    /* BeaconProxy */
    owner = await cd._setMovieProducer("0", "0x60C1F061B4fd365389dEFa3596FfFC8749D83b3B");
    // console.log("owner =", owner);

    /******************************************************************************/
    

  // Non deploy functions

    /******************************************************************************/


    // await cd.deployed();
    // console.log("Deployed to : ", cd.address);

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