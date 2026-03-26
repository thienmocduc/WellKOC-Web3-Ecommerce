// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title WK Token — WellKOC Governance & Gamification Token
 * @notice ERC-20 with governance voting + permit + staking
 */
contract WKToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1B WK
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address initialOwner) ERC20("WellKOC Token","WK") ERC20Permit("WellKOC Token") Ownable(initialOwner) {
        _mint(initialOwner, 100_000_000 * 1e18); // 100M initial
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked");
        uint256 duration = block.timestamp - stakeTimestamp[msg.sender];
        uint256 reward = (amount * duration * 5) / (365 days * 100); // 5% APY
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        if(reward > 0 && totalSupply() + reward <= MAX_SUPPLY) _mint(msg.sender, reward);
        emit Unstaked(msg.sender, amount, reward);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) { super._update(from, to, value); }
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) { return super.nonces(owner); }
}
