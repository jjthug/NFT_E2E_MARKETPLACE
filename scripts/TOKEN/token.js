const { ethers, upgrades } = require("hardhat");

async function main() {

  /******************************************************************************/

  const TOKEN = "0x1B4581B71A642c551830E6B5B1F319aA6427009E";
  const USER = "0x726266f9f2517Dd5EB0bBE523823B9517d07A0B0";
  const RECIPIENT = "0x726266f9f2517Dd5EB0bBE523823B9517d07A0B0";
  const AMOUNT = (10 * 10**18).toString();
  const ERC20_PROXY = "0xb35848fFdF52e69dF9CE5c3e4eD141Aae6d08C25";

  /******************************************************************************/

  let CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");
  token = await CD.attach(TOKEN);

  /* Transfer */
  // console.log("Transferring ", AMOUNT, " to ",RECIPIENT, "...");
  // await token.transfer(RECIPIENT, AMOUNT);
  // console.log("Transferred ", AMOUNT, " to ",RECIPIENT);

  /* Balance of user */
  // let bal = await token.balanceOf(USER);
  // console.log("Balance = ",bal.toString());

  /* Check approved amount to ERC20 transfer proxy */
  // let approvedAmount = await token.allowance(USER,ERC20_PROXY);
  // console.log("Allowance to ",ERC20_PROXY," by ",USER, " = ", approvedAmount.toString());

  /******************************************************************************/
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });