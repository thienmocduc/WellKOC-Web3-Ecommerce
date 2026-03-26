// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title Creator Token — Per-KOC Fan Token
 * @notice Each KOC deploys their own ERC-20 fan token
 */
contract CreatorToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;
    uint256 public price; // WK per creator token
    address public kocAddress;
    constructor(string memory name, string memory symbol, address koc, uint256 _price) ERC20(name, symbol) Ownable(koc) {
        kocAddress = koc;
        price = _price;
        _mint(koc, 10_000_000 * 1e18); // 10% to creator
    }
    function buy(uint256 amount) external payable {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(msg.sender, amount);
        payable(kocAddress).transfer(msg.value * 90 / 100);
    }
}

contract CreatorTokenFactory is Ownable {
    mapping(address => address) public kocToken;
    event CreatorTokenDeployed(address indexed koc, address token, string symbol);
    constructor() Ownable(msg.sender) {}
    function deployCreatorToken(string calldata name, string calldata symbol, uint256 priceWei) external returns (address) {
        require(kocToken[msg.sender] == address(0), "Already has creator token");
        CreatorToken token = new CreatorToken(name, symbol, msg.sender, priceWei);
        kocToken[msg.sender] = address(token);
        emit CreatorTokenDeployed(msg.sender, address(token), symbol);
        return address(token);
    }
}
