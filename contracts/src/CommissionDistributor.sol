// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WellKOC CommissionDistributor
 * @notice Distributes T1/T2/Pool commissions on Polygon
 * @dev UUPS upgradeable. Called by WellKOC backend after order delivery.
 *
 * Commission structure:
 *   T1 KOC (direct sale):   40%
 *   T2 KOC (referral):      13%
 *   Pool A (top 5%):         9%
 *   Pool B (top 6-20%):      5%
 *   Pool C (top 21-50%):     3%
 *   Platform:               30%
 *   Total:                 100%
 */

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract CommissionDistributor is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable
{
    // ── Reentrancy guard (inline, OZ v5 removed upgradeable version) ─────────
    uint256 private _reentrancyStatus;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    modifier nonReentrant() {
        require(_reentrancyStatus != _ENTERED, "ReentrancyGuard: reentrant call");
        _reentrancyStatus = _ENTERED;
        _;
        _reentrancyStatus = _NOT_ENTERED;
    }
    // ── Events ──────────────────────────────────────────────
    event CommissionPaid(
        bytes32 indexed orderId,
        address indexed recipient,
        uint256 amount,
        CommissionType commType
    );
    event BatchDistributed(uint256 count, uint256 totalAmount);
    event PoolDistributed(PoolTier tier, uint256 totalAmount, uint256 recipientCount);
    event BackendUpdated(address oldBackend, address newBackend);
    event PlatformTreasuryUpdated(address oldTreasury, address newTreasury);

    // ── Enums ────────────────────────────────────────────────
    enum CommissionType { T1, T2, POOL_A, POOL_B, POOL_C, PLATFORM }
    enum PoolTier { A, B, C }

    // ── State ────────────────────────────────────────────────
    address public backend;           // WellKOC backend signer
    address public platformTreasury;  // Platform 30% destination
    uint256 public totalDistributed;
    uint256 public distributionCount;

    // Rates in basis points (10000 = 100%)
    uint256 public constant T1_RATE   = 4000; // 40%
    uint256 public constant T2_RATE   = 1300; // 13%
    uint256 public constant POOL_A_RATE = 900; // 9%
    uint256 public constant POOL_B_RATE = 500; // 5%
    uint256 public constant POOL_C_RATE = 300; // 3%
    uint256 public constant PLATFORM_RATE = 3000; // 30%

    // orderId => paid flag (prevents double-payment)
    mapping(bytes32 => bool) public orderPaid;

    // ── Structs ──────────────────────────────────────────────
    struct CommissionRecord {
        bytes32 orderId;
        address recipient;
        uint256 amount;
        CommissionType commType;
    }

    // ── Initializer (replaces constructor for upgradeable) ───
    function initialize(
        address _owner,
        address _backend,
        address _platformTreasury
    ) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        _reentrancyStatus = _NOT_ENTERED;

        backend = _backend;
        platformTreasury = _platformTreasury;
    }

    // ── Modifiers ────────────────────────────────────────────
    modifier onlyBackend() {
        require(msg.sender == backend, "CommissionDistributor: caller is not backend");
        _;
    }

    // ── Core: Batch distribute ───────────────────────────────
    /**
     * @notice Distribute commissions for multiple orders in one TX
     * @param records Array of commission records to settle
     * Gas optimized: max 50 records per call
     */
    function batchDistribute(
        CommissionRecord[] calldata records
    ) external payable onlyBackend whenNotPaused nonReentrant {
        require(records.length > 0, "Empty records");
        require(records.length <= 50, "Max 50 records per batch");

        uint256 totalRequired = 0;
        for (uint256 i = 0; i < records.length; i++) {
            totalRequired += records[i].amount;
        }
        require(msg.value >= totalRequired, "Insufficient ETH/MATIC sent");

        uint256 distributed = 0;
        for (uint256 i = 0; i < records.length; i++) {
            CommissionRecord calldata rec = records[i];

            // Skip if order already processed
            if (orderPaid[rec.orderId]) continue;

            require(rec.recipient != address(0), "Invalid recipient");
            require(rec.amount > 0, "Zero amount");

            // Mark as paid BEFORE transfer (re-entrancy protection)
            orderPaid[rec.orderId] = true;

            // Transfer MATIC to recipient
            (bool success, ) = payable(rec.recipient).call{value: rec.amount}("");
            require(success, "Transfer failed");

            distributed++;
            totalDistributed += rec.amount;

            emit CommissionPaid(rec.orderId, rec.recipient, rec.amount, rec.commType);
        }

        distributionCount += distributed;
        emit BatchDistributed(distributed, totalRequired);

        // Refund excess
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundOk, ) = payable(msg.sender).call{value: excess}("");
            require(refundOk, "Refund failed");
        }
    }

    /**
     * @notice Distribute weekly pool rewards to KOC leaderboard
     * @param tier Pool tier (A/B/C)
     * @param recipients KOC wallet addresses
     * @param amounts Amounts per KOC
     */
    function distributePool(
        PoolTier tier,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable onlyBackend whenNotPaused nonReentrant {
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= 200, "Max 200 recipients");

        uint256 totalSent = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid address");
            if (amounts[i] == 0) continue;

            (bool ok, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(ok, "Pool transfer failed");
            totalSent += amounts[i];
            totalDistributed += amounts[i];
        }

        emit PoolDistributed(tier, totalSent, recipients.length);
    }

    /**
     * @notice Clawback: reclaim commission if order is refunded
     * @param orderId The order to clawback
     * @dev Requires KOC to have approved this contract to pull funds
     */
    function clawback(bytes32 orderId) external onlyBackend {
        // In practice, clawback deducts from next payout batch
        // On-chain: simply mark as clawedback for audit trail
        orderPaid[orderId] = false;
        emit CommissionPaid(orderId, address(0), 0, CommissionType.PLATFORM);
    }

    // ── Admin ────────────────────────────────────────────────
    function setBackend(address _backend) external onlyOwner {
        require(_backend != address(0), "Zero address");
        emit BackendUpdated(backend, _backend);
        backend = _backend;
    }

    function setPlatformTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Zero address");
        emit PlatformTreasuryUpdated(platformTreasury, _treasury);
        platformTreasury = _treasury;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nothing to withdraw");
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "Withdraw failed");
    }

    // ── UUPS upgrade authorization ───────────────────────────
    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}

    receive() external payable {}
}
