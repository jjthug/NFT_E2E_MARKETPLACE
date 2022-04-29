const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const { PK_JFD, PKJJ, PK_ZZZ, PK_ORIGIN, PK_BUYER, PK_RNT, URL_RINKEBY, URL_MUMBAI, URL_POLYGON, API_KEY_RINKEBY, API_KEY_MUMBAI } = process.env;
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require('solidity-coverage');

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
paths:{
  // tests:"./test_mumbai"
  // tests:"./test_rinkeby"
},
mocha:{
  timeout:300000
},
networks: {
  hardhat: {
    // gasPrice : 500 * 1000000000
  },
  rinkeby:{
    // gasPrice : secret.gasPrice * 1000000000,
    url: URL_RINKEBY,
    accounts: [PKJJ,PK_BUYER]
  },
  mumbai:{
    // gasPrice : secret.gasPrice * 1000000000,
    url: URL_MUMBAI,
    accounts: [PK_JFD,PK_BUYER]
  },
  rinkebyTest:{
    url: URL_RINKEBY,
    accounts: [PKJJ,PK_BUYER,PK_ZZZ,PK_ORIGIN,PK_JFD]
  },
  mumbaiTest:{
    url: URL_MUMBAI,
    accounts: [PK_JFD,PK_BUYER,PK_ZZZ,PK_ORIGIN,PKJJ]
  },
  polygon:{
    url: URL_POLYGON,
    accounts: [PK_RNT]
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