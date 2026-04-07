// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WellKOC DPP NFT Factory
 * @notice Soulbound Digital Product Passport NFTs on Polygon
 * @dev ERC-721 non-transferable. Each product gets one DPP NFT.
 *      Metadata stored on IPFS. EU DPP Regulation 2026 compliant.
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DPPFactory is ERC721URIStorage, AccessControl {
    // ── Roles ────────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant UPDATER_ROLE  = keccak256("UPDATER_ROLE");

    // ── Events ───────────────────────────────────────────────
    event DPPMinted(
        uint256 indexed tokenId,
        bytes32 indexed productId,
        address indexed vendor,
        string ipfsURI
    );
    event DPPUpdated(uint256 indexed tokenId, string newURI);
    event DPPVerified(uint256 indexed tokenId, address scanner);

    // ── State ────────────────────────────────────────────────
    // OZ v5 removed Counters — use plain uint256 instead
    uint256 private _nextTokenId;

    struct DPPMetadata {
        bytes32 productId;   // WellKOC internal product UUID
        address vendor;      // Vendor wallet
        uint256 mintedAt;
        uint256 updatedAt;
        bool active;
    }

    mapping(uint256 => DPPMetadata) public dppData;
    mapping(bytes32 => uint256) public productToDPP;  // productId → tokenId

    // ── Constructor ──────────────────────────────────────────
    constructor(address admin, address minter) ERC721("WellKOC DPP", "DPP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(UPDATER_ROLE, minter);
    }

    // ── Mint ─────────────────────────────────────────────────
    /**
     * @notice Mint a DPP NFT for a verified product
     * @param productId WellKOC product UUID (bytes32)
     * @param vendor Vendor wallet address
     * @param ipfsURI IPFS URI containing DPP metadata JSON
     */
    function mintDPP(
        bytes32 productId,
        address vendor,
        string calldata ipfsURI
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        require(vendor != address(0), "Invalid vendor");
        require(bytes(ipfsURI).length > 0, "Empty URI");
        require(productToDPP[productId] == 0, "DPP already exists");

        _nextTokenId++;
        tokenId = _nextTokenId;

        _mint(vendor, tokenId);
        _setTokenURI(tokenId, ipfsURI);

        dppData[tokenId] = DPPMetadata({
            productId: productId,
            vendor: vendor,
            mintedAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });
        productToDPP[productId] = tokenId;

        emit DPPMinted(tokenId, productId, vendor, ipfsURI);
    }

    /**
     * @notice Update DPP metadata URI (e.g. new certification)
     */
    function updateDPP(
        uint256 tokenId,
        string calldata newURI
    ) external onlyRole(UPDATER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newURI);
        dppData[tokenId].updatedAt = block.timestamp;
        emit DPPUpdated(tokenId, newURI);
    }

    /**
     * @notice Log QR scan event for analytics
     */
    function scanVerify(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        emit DPPVerified(tokenId, msg.sender);
    }

    // ── SOULBOUND: Block all transfers ───────────────────────
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow mint (from == 0) but block transfers
        require(from == address(0), "DPP NFT is soulbound and non-transferable");
        return super._update(to, tokenId, auth);
    }

    // ── View ─────────────────────────────────────────────────
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function getDPPByProduct(bytes32 productId) external view returns (uint256, DPPMetadata memory) {
        uint256 tokenId = productToDPP[productId];
        return (tokenId, dppData[tokenId]);
    }

    // ── Supports interface ───────────────────────────────────
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
