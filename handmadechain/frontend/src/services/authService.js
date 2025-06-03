import { ethers } from 'ethers';
import contracts from '@/config/contracts.json';

// HandmadeNFT ABI - sadece ihtiyacımız olan fonksiyonlar
const ABI = [
    "function owner() public view returns (address)",
    "function isApprovedSeller(address seller) public view returns (bool)"
];

export const checkIsSeller = async (address) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contracts.sepolia.handmadeNFT, ABI, provider);
        
        // Kontrat sahibi mi kontrol et
        const owner = await contract.owner();
        if (owner.toLowerCase() === address.toLowerCase()) {
            return true;
        }

        // Onaylı satıcı mı kontrol et
        const isApproved = await contract.isApprovedSeller(address);
        return isApproved;
    } catch (error) {
        console.error('Satıcı kontrolü hatası:', error);
        return false;
    }
}; 