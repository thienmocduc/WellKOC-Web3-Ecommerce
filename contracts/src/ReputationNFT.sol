// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
/**
 * @title WellKOC Reputation NFT — Soulbound KOC Identity
 * @notice Non-transferable NFT tracking KOC on-chain history
 */
contract ReputationNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _ids;
    struct KOCData { uint256 totalGMV; uint256 totalOrders; uint8 tier; uint256 joinedAt; string handle; }
    mapping(uint256 => KOCData) public kocData;
    mapping(address => uint256) public kocToToken;
    event ReputationUpdated(uint256 indexed tokenId, uint256 gmv, uint8 tier);

    constructor(address admin, address minter) ERC721("WellKOC Reputation","WKREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
    }

    function mintReputation(address koc, string calldata uri, string calldata handle) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(kocToToken[koc] == 0, "Already has reputation NFT");
        _ids.increment();
        uint256 id = _ids.current();
        _mint(koc, id);
        _setTokenURI(id, uri);
        kocData[id] = KOCData(0, 0, 0, block.timestamp, handle);
        kocToToken[koc] = id;
        return id;
    }

    function updateReputation(uint256 tokenId, uint256 gmvDelta, uint256 ordersDelta, uint8 newTier, string calldata newUri) external onlyRole(MINTER_ROLE) {
        kocData[tokenId].totalGMV += gmvDelta;
        kocData[tokenId].totalOrders += ordersDelta;
        kocData[tokenId].tier = newTier;
        _setTokenURI(tokenId, newUri);
        emit ReputationUpdated(tokenId, kocData[tokenId].totalGMV, newTier);
    }

    // Soulbound — block transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Reputation NFT is soulbound");
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 id) public view override(ERC721URIStorage, AccessControl) returns (bool) { return super.supportsInterface(id); }
}
