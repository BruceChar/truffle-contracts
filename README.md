### 配置文件
#### truffle-config.js

```js
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

const privateKeys = process.env.PRIVATE_KEYS || ""

module.exports= {
    
    contracts_directory: './src/contracts',		//合约路径
    contracts_build_directory: './src/abis',	//编译生成abi文件路径

    networks: {
        development: {
         host: "127.0.0.1",     // Localhost (default: none)
         port: 8545,            // Standard Ethereum port (default: none)
         network_id: "*",       // Any network (default: none)
        },

        // 以太坊主网，通过infura api发布
        mainnet: {
          provider: () => new HDWalletProvider(
            privateKeys.split(','),
            `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
          ),
          network_id: 1,       // Custom network
          gas: 4000000,           // Gas sent with each transaction (default: ~6700000)
          gasPrice: 1000000000,  // 1 gwei (in wei) (default: 100 gwei)
          timeoutBlocks: 200000,
          networkCheckTimeout: 100000,
        },
         
        ropsten: {
          provider: () => new HDWalletProvider(
            privateKeys.split(','),
            `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
          ),
          network_id: 3,       // Ropsten's id, mainnet is 1
          gas: 5500000,        // Ropsten has a lower block limit than mainnet
          gasPrice: 2500000000, //2.5 gwei
          confirmations: 2,    // # of confs to wait between deployments. (default: 0)
          timeoutBlocks: 20000,  //deploy times out  (minimum/default: 50)
          // skipDryRun: true,     // Skip dry run before migrations? (default: false)
          networkCheckTimeout: 10000,
        },
        
    }
}

```

### 依赖
合约可以通过`import`关键字引入其他依赖  

	import "./AnotherContract.sol";	//本地库
	import import "openzeppelin-solidity/contracts/math/SafeMath.sol";	//第三方安装的库

### 编译
	truffle compile	//只编译上次以来更新过的文件
	truffle compile --all  //重新编译所有文件


### 测试

```js
truffle test ./test/test_file_name.js
```

### 部署
将编译的合约部署到以太坊网络，本地测试先保证连接到一个测试网络，如Ganache，或者infura之类

```js
truffle migrate	//从最新的部署脚本开始运行
truffle migrate --reset 	//重新运行所有部署脚本
 truffle migrate --network topsten    //指定网络
```
##### 部署测试

```js
truffle migrate --dry-run
```




#### 部署脚本

以数字开头，如`2_deploy_contracts.js`，数字按顺序记录合约部署的过程。

	const Token = artifacts.require('TokenInstance')	//引入合约对象，不要用文件名

所有部署过程必须通过`module.exports`将部署函数导出。部署函数必须接受一个`deployer`对象作为第一个参数

	module.exports = async function(deployer) { deployer.deploy(Token) }


### 自动验证
安装`truffle-verify-plugin`自动验证合约

登录以太坊浏览器，下载API-KEYs

```
npm install -D truffle-verify-plugin

// truffle-config.js
{
  ...rest of config
  plugins: [
    'truffle-verify-plugin'
  ],
  api_keys: {
    etherscan: process.env.ETHSCAN_API_KEY
  }
}

// 命令
truffle run verify ContractName --network ropsten --debug
```

