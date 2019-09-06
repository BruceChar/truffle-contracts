pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract owned {
    address payable public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Limited authority!");
        _;
    }

    function transferOwnership(address payable newOwner) onlyOwner public {
        owner = newOwner;
    }
}

// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
/*interface ERC20Interface {
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function transfer(address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
*/
/******************************************/
/*      TOKEN INSTANCE STARTS HERE       */
/******************************************/

contract TokenInstance is owned {
    
    using SafeMath for uint256;
    
    //variables of the token, EIP20 standard
    string public name = "Test Token";
    string public symbol = "TT";
    uint256 public decimals = 18; // 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply = uint(100000000).mul(uint(10) ** decimals);
    

    // mapping structure
    mapping (address => uint256) public balanceOf;  //eip20
    mapping (address => mapping (address => uint256)) public allowance; //eip20
    
    mapping (address => bool) public frozenAccount;

    /* This generates a public event on the blockchain that will notify clients */
    event Transfer(address indexed from, address indexed to, uint tokens);  //eip20
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);   //eip20
    
    event Frozen(address indexed target);
    event Unfrozen(address indexed target);
    event Burn(address indexed target, uint256 tokens);
	event Decline(address indexed owner, address indexed spender, uint tokens);
	

    /* Initializes contract with initial supply tokens to the creator of the contract */
    constructor () public {
        balanceOf[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
    }
    
    
    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint _value) internal returns (bool) {
        require (_to != address(0x0));  // Prevent transfer to 0x0 address. Use burn() instead
        require(_from != _to, "The target account cannot be same with the source account!");
        require (balanceOf[_from] >= _value, "No enough balance to transfer!");               // Check if the sender has enough
        require(!frozenAccount[_from] && !frozenAccount[_to], "Account is frozen!");                     // Check if accounts are frozen
        
        balanceOf[_from] = balanceOf[_from].sub(_value);                         // Subtract from the sender
        balanceOf[_to] = balanceOf[_to].add(_value);                           // Add the same to the recipient
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    

    // ------------------------------------------------------------------------
    // Transfer the balance from token owner's account to to account
    // - Owner's account must have sufficient balance to transfer
    // - 0 value transfers are allowance
    // ------------------------------------------------------------------------
    function transfer(address to, uint tokens) public returns (bool success) {
        return _transfer(msg.sender, to, tokens);
    }
    
    function multiTransfer(address[] memory tos, uint[] memory tokens) public returns(bool) {
        require(tos.length == tokens.length, "Number of address doesn't match the tokens!");
        for (uint i = 0; i < tos.length; i++) {
            bool flag = _transfer(msg.sender, tos[i], tokens[i]);
            if (!flag) {
                continue;
            }
        }
    }


    // ------------------------------------------------------------------------
    // Token owner can approve for spender to transferFrom(...) tokens
    // from the token owner's account
    //
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
    // recommends that there are no checks for the approval double-spend attack
    // as this should be implemented in user interfaces 
    // ------------------------------------------------------------------------
    function approve(address spender, uint tokens) public returns (bool success) {
        allowance[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    //Token owner can decline the allowance of the spender
	function decline(address spender, uint tokens) public returns (bool success) {
		uint dec = tokens;
		if (allowance[msg.sender][spender] < tokens) {
			dec = allowance[msg.sender][spender];
		}
		allowance[msg.sender][spender] = allowance[msg.sender][spender].sub(dec);
		emit Decline(msg.sender, spender, dec);
		return true;
	}
	
    // ------------------------------------------------------------------------
    // Transfer tokens from the from account to the to account
    // 
    // The calling account must already have sufficient tokens approve(...)-d
    // for spending from the from account and
    // - From account must have sufficient balance to transfer
    // - Spender must have sufficient allowance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        require(balanceOf[from] >= tokens, "No enough tokens!");
        balanceOf[from] = balanceOf[from].sub(tokens);
        allowance[from][msg.sender] = allowance[from][msg.sender].sub(tokens);
        balanceOf[to] = balanceOf[to].add(tokens);
        emit Transfer(from, to, tokens);
        return true;
    }


    /// @notice Create `mintedAmount` tokens and send it to `target`
    /// @param target Address to receive the tokens
    /// @param mintedAmount the amount of tokens it will receive
    function mintToken(address target, uint256 mintedAmount) onlyOwner public {
        balanceOf[target] = balanceOf[target].add(mintedAmount);
        totalSupply = totalSupply.add(mintedAmount);
        emit Transfer(address(0), target, mintedAmount);
    }

    /// @notice `freeze? Prevent | Allow` `target` from sending & receiving tokens
    /// @param target Address to be frozen

    function freezeAccount(address target) onlyOwner public {
        require(target != owner, "Cannot freeze owner account!");
        frozenAccount[target] = !frozenAccount[target];
        if (frozenAccount[target]) {
            emit Frozen(target);
        } else {
            emit Unfrozen(target);
        }
    }

    
    function burn(address account, uint256 tokens) onlyOwner public {
        require(!frozenAccount[account], "Account is frozen!");
        
        if (tokens > balanceOf[account]) {
            tokens = balanceOf[account];
        }
        balanceOf[account] = balanceOf[account].sub(tokens);
        emit Burn(account, tokens);
    }
    
    //destroy this contract
    function destroy() onlyOwner public {
        selfdestruct(owner);
    }
    

    //Fallback: reverts if Ether is sent to this smart contract by mistake
	function () external {
		revert();
	}
}




