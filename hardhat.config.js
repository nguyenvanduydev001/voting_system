require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "zkEVM",
  networks: {
    hardhat: {},
    zkEVM: {
      url: API_URL,
      accounts: [
        PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
      ],
      gas: 210000,
      gasPrice: 8000000000,
    },
  },
};
