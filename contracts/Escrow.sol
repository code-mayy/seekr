// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Escrow
 * @dev A secure escrow contract for marketplace transactions
 * @notice This contract holds funds until delivery is confirmed or refunded
 */
contract Escrow {
    enum EscrowStatus {
        PENDING,
        DELIVERED,
        REFUNDED,
        DISPUTED
    }

    struct EscrowTransaction {
        address buyer;
        address seller;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 deliveryDeadline;
        string itemDescription;
        bool buyerConfirmed;
        bool sellerConfirmed;
    }

    mapping(uint256 => EscrowTransaction) public escrows;
    uint256 public nextEscrowId;
    
    // Fee configuration (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    address public platformWallet;
    address public owner;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string itemDescription
    );
    
    event DeliveryConfirmed(
        uint256 indexed escrowId,
        address indexed confirmer
    );
    
    event EscrowCompleted(
        uint256 indexed escrowId,
        uint256 sellerAmount,
        uint256 platformFeeAmount
    );
    
    event EscrowRefunded(
        uint256 indexed escrowId,
        uint256 refundAmount
    );
    
    event DisputeRaised(
        uint256 indexed escrowId,
        address indexed raiser
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyBuyer(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].buyer, "Only buyer can call this function");
        _;
    }

    modifier onlySeller(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].seller, "Only seller can call this function");
        _;
    }

    modifier onlyParticipant(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].buyer || msg.sender == escrows[escrowId].seller,
            "Only buyer or seller can call this function"
        );
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        require(escrowId < nextEscrowId, "Escrow does not exist");
        _;
    }

    modifier escrowPending(uint256 escrowId) {
        require(escrows[escrowId].status == EscrowStatus.PENDING, "Escrow is not pending");
        _;
    }

    constructor(address _platformWallet) {
        owner = msg.sender;
        platformWallet = _platformWallet;
        nextEscrowId = 1;
    }

    /**
     * @dev Create a new escrow transaction
     * @param seller The seller's address
     * @param itemDescription Description of the item being sold
     * @param deliveryDays Number of days for delivery deadline
     */
    function createEscrow(
        address seller,
        string memory itemDescription,
        uint256 deliveryDays
    ) external payable returns (uint256) {
        require(msg.value > 0, "Escrow amount must be greater than 0");
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer and seller cannot be the same");
        require(deliveryDays > 0 && deliveryDays <= 365, "Invalid delivery days");

        uint256 escrowId = nextEscrowId++;
        uint256 deliveryDeadline = block.timestamp + (deliveryDays * 1 days);

        escrows[escrowId] = EscrowTransaction({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            status: EscrowStatus.PENDING,
            createdAt: block.timestamp,
            deliveryDeadline: deliveryDeadline,
            itemDescription: itemDescription,
            buyerConfirmed: false,
            sellerConfirmed: false
        });

        emit EscrowCreated(escrowId, msg.sender, seller, msg.value, itemDescription);
        return escrowId;
    }

    /**
     * @dev Confirm delivery of the item
     * @param escrowId The escrow transaction ID
     */
    function confirmDelivery(uint256 escrowId) 
        external 
        escrowExists(escrowId) 
        escrowPending(escrowId) 
        onlyParticipant(escrowId) 
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        
        if (msg.sender == escrow.buyer) {
            escrow.buyerConfirmed = true;
        } else {
            escrow.sellerConfirmed = true;
        }

        emit DeliveryConfirmed(escrowId, msg.sender);

        // Complete escrow if both parties confirmed or buyer confirmed
        if (escrow.buyerConfirmed || (escrow.buyerConfirmed && escrow.sellerConfirmed)) {
            _completeEscrow(escrowId);
        }
    }

    /**
     * @dev Request refund (only buyer can call before delivery deadline)
     * @param escrowId The escrow transaction ID
     */
    function requestRefund(uint256 escrowId) 
        external 
        escrowExists(escrowId) 
        escrowPending(escrowId) 
        onlyBuyer(escrowId) 
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        require(block.timestamp > escrow.deliveryDeadline, "Cannot refund before delivery deadline");

        escrow.status = EscrowStatus.REFUNDED;
        
        // Refund the full amount to buyer (no platform fee on refunds)
        payable(escrow.buyer).transfer(escrow.amount);
        
        emit EscrowRefunded(escrowId, escrow.amount);
    }

    /**
     * @dev Raise a dispute (can be called by either party)
     * @param escrowId The escrow transaction ID
     */
    function raiseDispute(uint256 escrowId) 
        external 
        escrowExists(escrowId) 
        escrowPending(escrowId) 
        onlyParticipant(escrowId) 
    {
        escrows[escrowId].status = EscrowStatus.DISPUTED;
        emit DisputeRaised(escrowId, msg.sender);
    }

    /**
     * @dev Resolve dispute (only owner can call)
     * @param escrowId The escrow transaction ID
     * @param refundToBuyer Whether to refund to buyer (true) or pay seller (false)
     */
    function resolveDispute(uint256 escrowId, bool refundToBuyer) 
        external 
        onlyOwner 
        escrowExists(escrowId) 
    {
        require(escrows[escrowId].status == EscrowStatus.DISPUTED, "Escrow is not disputed");
        
        if (refundToBuyer) {
            escrows[escrowId].status = EscrowStatus.REFUNDED;
            payable(escrows[escrowId].buyer).transfer(escrows[escrowId].amount);
            emit EscrowRefunded(escrowId, escrows[escrowId].amount);
        } else {
            _completeEscrow(escrowId);
        }
    }

    /**
     * @dev Complete the escrow transaction
     * @param escrowId The escrow transaction ID
     */
    function _completeEscrow(uint256 escrowId) internal {
        EscrowTransaction storage escrow = escrows[escrowId];
        escrow.status = EscrowStatus.DELIVERED;

        uint256 feeAmount = (escrow.amount * platformFee) / 10000;
        uint256 sellerAmount = escrow.amount - feeAmount;

        // Transfer funds
        if (feeAmount > 0) {
            payable(platformWallet).transfer(feeAmount);
        }
        payable(escrow.seller).transfer(sellerAmount);

        emit EscrowCompleted(escrowId, sellerAmount, feeAmount);
    }

    /**
     * @dev Get escrow details
     * @param escrowId The escrow transaction ID
     */
    function getEscrow(uint256 escrowId) 
        external 
        view 
        escrowExists(escrowId) 
        returns (EscrowTransaction memory) 
    {
        return escrows[escrowId];
    }

    /**
     * @dev Get escrows for a specific address
     * @param user The user's address
     */
    function getUserEscrows(address user) external view returns (uint256[] memory) {
        uint256[] memory userEscrows = new uint256[](nextEscrowId - 1);
        uint256 count = 0;

        for (uint256 i = 1; i < nextEscrowId; i++) {
            if (escrows[i].buyer == user || escrows[i].seller == user) {
                userEscrows[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userEscrows[i];
        }

        return result;
    }

    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Update platform wallet (only owner)
     * @param newWallet New platform wallet address
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        platformWallet = newWallet;
    }

    /**
     * @dev Emergency withdrawal (only owner, for stuck funds)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Check if delivery deadline has passed
     * @param escrowId The escrow transaction ID
     */
    function isDeliveryOverdue(uint256 escrowId) external view escrowExists(escrowId) returns (bool) {
        return block.timestamp > escrows[escrowId].deliveryDeadline;
    }
}