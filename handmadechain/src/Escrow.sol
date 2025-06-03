// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public immutable buyer;
    address public immutable seller;
    uint256 public immutable amount;
    bool public isCompleted;
    bool public isCancelled;

    event DeliveryConfirmed(address indexed seller, uint256 amount);
    event EscrowCancelled(address indexed buyer, uint256 amount);

    error OnlyBuyer();
    error AlreadyCompleted();
    error AlreadyCancelled();
    error InvalidAmount();

    modifier onlyBuyer() {
        if (msg.sender != buyer) revert OnlyBuyer();
        _;
    }

    modifier notCompleted() {
        if (isCompleted) revert AlreadyCompleted();
        if (isCancelled) revert AlreadyCancelled();
        _;
    }

    constructor(address _seller) payable {
        if (msg.value == 0) revert InvalidAmount();
        buyer = msg.sender;
        seller = _seller;
        amount = msg.value;
    }

    /**
     * @dev Alıcı teslimatı onayladığında satıcıya ödemeyi gönderir
     */
    function confirmDelivery() external onlyBuyer notCompleted {
        isCompleted = true;
        (bool success, ) = seller.call{value: amount}("");
        require(success, "Transfer failed");
        emit DeliveryConfirmed(seller, amount);
    }

    /**
     * @dev Alıcı işlemi iptal ettiğinde parayı iade eder
     */
    function cancel() external onlyBuyer notCompleted {
        isCancelled = true;
        (bool success, ) = buyer.call{value: amount}("");
        require(success, "Transfer failed");
        emit EscrowCancelled(buyer, amount);
    }

    /**
     * @dev Kontratın bakiyesini kontrol eder
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 