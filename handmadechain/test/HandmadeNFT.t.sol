// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/HandmadeNFT.sol";

contract HandmadeNFTTest is Test {
    HandmadeNFT public nft;
    address public owner;
    address public user;

    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");
        vm.startPrank(owner);
        nft = new HandmadeNFT();
        vm.stopPrank();
    }

    function test_Mint() public {
        string memory uri = "ipfs://QmTest123";
        vm.startPrank(owner);
        uint256 tokenId = nft.mint(user, uri);
        vm.stopPrank();

        assertEq(nft.ownerOf(tokenId), user);
        assertEq(nft.tokenURI(tokenId), uri);
    }

    function test_RevertWhen_MintNotOwner() public {
        string memory uri = "ipfs://QmTest123";
        vm.startPrank(user);
        vm.expectRevert();
        nft.mint(user, uri);
    }
} 