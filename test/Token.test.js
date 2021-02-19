const Token = artifacts.require('Token')
require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Token', async ([deployer, receiver, spender]) => {

  const name = "Exodus Network"
  const symbol = "EXO"
  const decimals = 6
  const supply = 10000
  let total = (supply * 10 ** decimals).toString()
  const EVM_REVERT = 'VM Exception while processing transaction: revert'
  const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
  // let token = await Token.new(name, symbol, supply, decimals) 

  before(async () => {
    token = await Token.new(name, symbol, supply, decimals) 
    console.log("token: ", token.address)
  })

  describe('Test deployment', () => {
    it('tracks the name', async () => {
      const re = await token.name()
      re.should.equal(name)
    })

    it('tracks the symbol', async () => {
      const re = await token.symbol()
      re.should.equal(symbol)
    })

    it('tracks the decimals', async () => {
      const re = await token.decimals()
      re.toString().should.equal(decimals.toString())
    })

    it('tracks the total supply', async () => {
      const re = await token.totalSupply()
      
      re.toString().should.equal(total)
    })

    it('tracks the creator', async() => {
      const re = await token.creator()
      re.toString().should.equal(deployer)
    })

    it('assign the total supply to deployer', async () => {
      const re = await token.balanceOf(deployer)
      re.toString().should.equal(total)
    })
	})
 
  describe('Test sending token', () => {
    let re
    let amount = 100
    // before(async () => {
    //   re = await token.transfer(receiver, amount, {from: deployer})
    // })

    describe('success cases', () => {
      it('transfer token balances', async () => {
        let val = 100
        await token.transfer(receiver, val, {from: deployer})
        let bal = await token.balanceOf(receiver)
        bal.toString().should.equal(val.toString())
      })

      it('emits transfer event', async () => {
        const log = re.logs[0]
        // console.log(log)
        log.event.should.eq('Transfer')
        const evt = log.args
        evt.from.should.eq(deployer)
        evt.to.should.eq(receiver)
        evt.token.toString().should.eq(amount.toString())
        
      })
    })

    describe('failure cases', () => {
      const invalid_amount = 30000000000
      it('reject insufficient balance', async () => {
        let re = await token.transfer(receiver, invalid_amount, {from: deployer})
        .should.be.rejectedWith(EVM_REVERT)
        // console.log('reject transfer result:', re)
      })

      it('reject invalid receipients', async () => {
        await token.transfer(ZERO_ADDR, amount, {from: deployer})
        .should.be.rejectedWith(EVM_REVERT)
      })

      it('reject send to self', async () => {
        await token.transfer(deployer, amount, {from: deployer})
        .should.be.rejectedWith(EVM_REVERT)
      })

      it('reject send 0 token', async () => {
        await token.transfer(receiver, 0, {from: deployer})
        .should.be.rejectedWith(EVM_REVERT)
      })

      it('reject invalid address, address should be 20 bytes', async() => {
        let re = await token.transfer('0x00000000000000000000000000000000000000001', amount, {from: deployer})
        .should.be.rejected
      })

      it('reject no enough token', async() => {
        let re = await token.transfer(spender, 1000, {from: receiver})
        .should.be.rejectedWith(EVM_REVERT)
      })

      it('reject frozen account', async () => {
        await token.freezeAccount(spender, {from: deployer})
        await token.transfer(receiver, 100, {from: spender})
        .should.be.rejectedWith(EVM_REVERT)
      })
    })
    
  })
 
  
  describe('Test approving tokens', () => {
    let re
    let amount 

    beforeEach(async () => {
      amount = 1000
      re = await token.approve(spender, amount, {from: deployer})
    })

    describe('success cases', () => {
      it('allocates an allowance for delegated token spending an exchange', async () => {
        const allowance = await token.allowance(deployer, spender)
        allowance.toString().should.eq(amount.toString())
      })

      it('emits approve event', async () => {
        const log = re.logs[0]
        log.event.should.eq('Approval')
        const evt = log.args
        evt.owner.should.eq(deployer)
        evt.spender.should.eq(spender)
        evt.token.toString().should.eq(amount.toString())
        
      })

      it('delegated transfer', async () => {
        let val = await token.allowance(deployer, spender)
        val.toString().should.eq(amount.toString())
        await token.transferFrom(deployer, receiver, amount, {from: spender})
        val = await token.allowance(deployer, spender)
        val.toString().should.eq('0')

      })
    })

    describe('failure cases', () => {
      it('reject invalid spender', async () => {
        await token.approve(ZERO_ADDR, amount, {from: deployer})
        .should.be.rejected
      })

      it('reject no enough token', async() => {
        await token.approve(spender, 2000, {from: receiver})
        .should.be.rejectedWith(EVM_REVERT)
      })

      it('reject no enough allowance', async() => {
        await token.transferFrom(deployer, receiver, 500, {from: spender})
        let al = await token.allowance(deployer, spender)
        al.toString().should.equal('500')
        await token.transferFrom(deployer, receiver, 600, {from: spender})
        .should.be.rejectedWith(EVM_REVERT)
        // console.log('transfer from reject:', re)
      })

      it('reject transfer 0 token', async() => {
        await token.transferFrom(deployer, receiver, 0, {from: spender})
        .should.be.rejectedWith(EVM_REVERT)
      })
    })

  })

  describe('Test destroy', () => {
    it('reject invalid creator', async () => {
      await token.destroy({from: receiver})
      .should.be.rejected
    })

    it('destroy the contract', async () => {
      // let de = await token.destroy({from: deployer})
      // console.log('destroy: ', de)
      re = await token.transfer(receiver, 100, {from: deployer})
      console.log('transfer: ', re)
      let bal = await token.balanceOf(receiver);
      console.log('balance:', bal)
      bal.toString().should.equal('100')

    })
  })
  
})