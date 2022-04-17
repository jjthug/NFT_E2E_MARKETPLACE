const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const { PK_JFD, PKJJ, PK_ZZZ, URL_RINKEBY, URL_MUMBAI, API_KEY_RINKEBY, API_KEY_MUMBAI } = process.env;
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");

module.exports = {

  solidity: {
    version:"0.7.6",
    settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
},
networks: {
  hardhat: {
    // gasPrice : 500 * 1000000000
  },
  rinkeby:{
    // gasPrice : secret.gasPrice * 1000000000,
    url: URL_RINKEBY,
    accounts: [PKJJ]
  },
  mumbai:{
    // gasPrice : secret.gasPrice * 1000000000,
    url: URL_MUMBAI,
    accounts: [PK_JFD]
  }
},
etherscan: {
  // Your API key for Etherscan
  // Obtain one at https://etherscan.io/
  apiKey: {
    rinkeby: API_KEY_RINKEBY,
    polygonMumbai: API_KEY_MUMBAI
  }
}
};