// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title W3CToken
 * @notice WellKOC platform governance and utility token
 * @dev ERC-20 on Polygon with burn and permit support
 *
 * Utility:
 * - Pay platform fees at 5% discount
 * - Governance voting on commission rate changes
 * - KOC tier upgrades
 * - Pool C contribution multiplier
 *
 * Tokenomics (Total: 10,000,000,000 W3C):
 * - Platform treasury: 30%  → 3,000,000,000 W3C
 * - KOC rewards:       40%  → 4,000,000,000 W3C
 * - Ecosystem fund:    20%  → 2,000,000,000 W3C
 * - Team (3yr vest):   10%  → 1,000,000,000 W3C
 */
contract W3CToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {

    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 tỷ W3C

    mapping(address => bool) public minters;

    event MinterAdded(address minter);
    event MinterRemoved(address minter);

    constructor() ERC20("WellKOC Token", "W3C") ERC20Permit("WellKOC Token") Ownable(msg.sender) {
        // Initial mint: 30% to treasury = 3,000,000,000 W3C
        _mint(msg.sender, 3_000_000_000 * 10**18);
    }

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not a minter");
        _;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function addMinter(address minter)    external onlyOwner { minters[minter] = true;  emit MinterAdded(minter); }
    function removeMinter(address minter) external onlyOwner { minters[minter] = false; emit MinterRemoved(minter); }
}
