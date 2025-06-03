// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HandmadeNFT is ERC721URIStorage, Ownable {
    // Token ID sayaç
    uint256 private _nextTokenId;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);

    constructor() ERC721("HandmadeNFT", "HMNFT") Ownable(msg.sender) {}

    /**
     * @dev Yeni bir NFT mint eder
     * @param uri NFT'nin IPFS metadata URI'si
     * @return tokenId Mint edilen NFT'nin ID'si
     */
    function mint(string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(msg.sender, tokenId, uri);
        return tokenId;
    }
} 