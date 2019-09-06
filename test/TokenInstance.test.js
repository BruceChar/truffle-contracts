const Token = artifacts.require('./TokenInstance')
require('chai')
  .use(require('chai-as-promised'))
  .should()



contract('TokenInstance', ([deployer, receiver, spender]) => {

  let token
  let supply = "100000000000000000000000000"

  before(async () => {
    token = await Token.new()
  })

  describe('Test deployment', () => {

    it('Tracks token info', async () => {
      const [name, symbol, decimals, totalSupply, owner] = await Promise
      .all([
        token.name(), 
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
        token.owner()
      ])
      name.should.eq("Test Token")
      symbol.should.eq("TT")
      decimals.toString().should.eq('18')
      totalSupply.toString().should.eq(supply)
      owner.should.eq(deployer)
    })

  })

  describe('transfer token', () => {

    describe('success', () => {

    })

    describe('failure', () => {

    })
  })
})