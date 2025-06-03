import { ethers } from 'ethers';
import contractABI from '../contracts/HandmadeChain.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

const getProvider = () => {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
};

const getContract = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask yüklü değil!');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (error) {
        throw new Error(`Cüzdan bağlantı hatası: ${error.message}`);
    }
};

export const mintNFT = async (tokenURI) => {
    try {
        const contract = await getContract();
        const tx = await contract.mint(tokenURI);
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        throw new Error(`NFT mint hatası: ${error.message}`);
    }
};

export const getNFTs = async () => {
    try {
        const contract = await getContract();
        const totalSupply = await contract.totalSupply();
        const nfts = [];

        for (let i = 0; i < totalSupply; i++) {
            const tokenId = await contract.tokenByIndex(i);
            const tokenURI = await contract.tokenURI(tokenId);
            nfts.push({ tokenId: tokenId.toString(), tokenURI });
        }

        return nfts;
    } catch (error) {
        throw new Error(`NFT listesi alınamadı: ${error.message}`);
    }
};

export const getNFTDetails = async (tokenId) => {
    try {
        const contract = await getContract();
        const tokenURI = await contract.tokenURI(tokenId);
        return { tokenId: tokenId.toString(), tokenURI };
    } catch (error) {
        throw new Error(`NFT detayları alınamadı: ${error.message}`);
    }
}; 