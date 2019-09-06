## 配置文件
### truffle-config.js
	
	contracts_directory: './src/contracts',		//合约路径
  	contracts_build_directory: './src/abis',	//编译生成abi文件路径

## 依赖
合约可以通过`import`关键字引入其他依赖  

	import "./AnotherContract.sol";	//本地库
	import import "openzeppelin-solidity/contracts/math/SafeMath.sol";	//第三方安装的库

## 编译
	truffle compile	//只编译上次以来更新过的文件
	truffle compile --all  //重新编译所有文件



## 部署
将编译的合约部署到以太坊网络，本地测试先保证连接到一个测试网络，如Ganache，或者infura之类

	truffle migrate	//从最新的部署脚本开始运行
	truffle migrate --reset 	//重新运行所有部署脚本

### 部署脚本
以数字开头，如`2_deploy_contracts.js`，数字按顺序记录合约部署的过程。

	const Token = artifacts.require('TokenInstance')	//引入合约对象，不要用文件名

所有部署过程必须通过`module.exports`将部署函数导出。部署函数必须接受一个`deployer`对象作为第一个参数

	module.exports = async function(deployer) { deployer.deploy(Token) }
  

