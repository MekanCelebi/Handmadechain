// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    address public buyer;
    address public seller;
    uint256 public constant INITIAL_AMOUNT = 1 ether;

    function setUp() public {
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        vm.deal(buyer, INITIAL_AMOUNT);
    }

    function test_Deploy() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        vm.stopPrank();

        assertEq(escrow.buyer(), buyer);
        assertEq(escrow.seller(), seller);
        assertEq(escrow.amount(), INITIAL_AMOUNT);
        assertEq(escrow.getBalance(), INITIAL_AMOUNT);
    }

    function test_ConfirmDelivery() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        escrow.confirmDelivery();
        vm.stopPrank();

        assertTrue(escrow.isCompleted());
        assertEq(escrow.getBalance(), 0);
        assertEq(seller.balance, INITIAL_AMOUNT);
    }

    function test_Cancel() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        escrow.cancel();
        vm.stopPrank();

        assertTrue(escrow.isCancelled());
        assertEq(escrow.getBalance(), 0);
        assertEq(buyer.balance, INITIAL_AMOUNT);
    }

    function test_RevertWhen_NotBuyerConfirms() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        vm.stopPrank();

        vm.startPrank(seller);
        vm.expectRevert(Escrow.OnlyBuyer.selector);
        escrow.confirmDelivery();
    }

    function test_RevertWhen_NotBuyerCancels() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        vm.stopPrank();

        vm.startPrank(seller);
        vm.expectRevert(Escrow.OnlyBuyer.selector);
        escrow.cancel();
    }

    function test_RevertWhen_AlreadyCompleted() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        escrow.confirmDelivery();
        vm.expectRevert(Escrow.AlreadyCompleted.selector);
        escrow.confirmDelivery();
    }

    function test_RevertWhen_AlreadyCancelled() public {
        vm.startPrank(buyer);
        escrow = new Escrow{value: INITIAL_AMOUNT}(seller);
        escrow.cancel();
        vm.expectRevert(Escrow.AlreadyCancelled.selector);
        escrow.cancel();
    }
} 