const Token = artifacts.require("TokenInstance");


module.exports = async function(deployer) {
  
  deployer.deploy(Token);
  // const accounts = await web3.eth.getAccounts()
  // const feeAccount = accounts[0]
  // const feePercent = 10

};