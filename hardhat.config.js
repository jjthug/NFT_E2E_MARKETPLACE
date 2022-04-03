require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
let secret = require("./secrets");

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
    url: secret.urlRinkeby,
    accounts: [secret.pkJFD]
  }
},
etherscan: {
  // Your API key for Etherscan
  // Obtain one at https://etherscan.io/
  apiKey: {
    rinkeby: secret.apiKey
  }
}
};