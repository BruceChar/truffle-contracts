const Token = artifacts.require("Token")


module.exports = async function(deployer, network) {
  console.log('Deploy contract at network: ', network)

  deployer.deploy(Token)
  // const accounts = await web3.eth.getAccounts()
  // const feeAccount = accounts[0]
  // const feePercent = 10

};