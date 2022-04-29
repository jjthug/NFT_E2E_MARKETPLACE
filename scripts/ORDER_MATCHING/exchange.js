const { ethers, upgrades } = require("hardhat");

async function main() {
  
  /********************************************************************/
  // EXAMPLE
  // needs to be modified for actual use

  const EXCHANGE_ADDRESS = "0x951EED6F11243835A1E5133CE3026CbBCBbe0869";

  /********************************************************************/

  let CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
  let exchange = await CD.attach(EXCHANGE_ADDRESS);

  let sellOrder = ["0xc0a0aea4f8457caa8c47ed5b5da410e40efcbf3c",[["0x1cdfaa40","0x00000000000000000000000065fd28bb09215e6219c82f4e4d9faf2ca60244260000000000000000000000000000000000000000000000000000000000000040c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000019000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000180000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d65376974635964735a6b78355145535277777779644b7377766f58635635336f463948686364676955696a660000000000000000000000000000000000000000000000000000000000000000000000000000000000001836316262333431646663643436393030313137333333663500000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000412307895217429b450458cea7628b5e5bf55919fd5c1f987b34038be1f43e758d1c0af9248f32c12e48d4df8b9fdeaaf75a1900fc359d2e2b157a232876ba49711b00000000000000000000000000000000000000000000000000000000000000"],1],"0x0000000000000000000000000000000000000000",[["0x8ae85d84","0x0000000000000000000000001b4581b71a642c551830e6b5b1f319aa6427009e"],1],"1650529658287",0,0,"0x23d235ef","0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000023f7f82eb917a49a722e970580ee138af5f71d7400000000000000000000000000000000000000000000000000000000000000fa"];
  let sellSig = "0x7d5312ce96e7b82cd186f4d8eb2df6cb9b562df77fc56a4dce45e013aae9aff15b5fbaf6f339b5db0e3a0d05148cc1dd377ec0b747737d25fff0891bfe919f281b";
  let buyOrder = ["0x5c4e14409701a2c3a83b10e4004d779815a3bfce",[["0x8ae85d84","0x0000000000000000000000001b4581b71a642c551830e6b5b1f319aa6427009e"],1],"0x0000000000000000000000000000000000000000",[["0x1cdfaa40","0x00000000000000000000000065fd28bb09215e6219c82f4e4d9faf2ca60244260000000000000000000000000000000000000000000000000000000000000040c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000019000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000180000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d65376974635964735a6b78355145535277777779644b7377766f58635635336f463948686364676955696a660000000000000000000000000000000000000000000000000000000000000000000000000000000000001836316262333431646663643436393030313137333333663500000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000412307895217429b450458cea7628b5e5bf55919fd5c1f987b34038be1f43e758d1c0af9248f32c12e48d4df8b9fdeaaf75a1900fc359d2e2b157a232876ba49711b00000000000000000000000000000000000000000000000000000000000000"],1],0,0,0,"0x23d235ef","0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000023f7f82eb917a49a722e970580ee138af5f71d7400000000000000000000000000000000000000000000000000000000000000fa"];
  let buySig = "0x";
  await exchange.matchOrders( buyOrder, buySig, sellOrder, sellSig);

  /********************************************************************/

  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });