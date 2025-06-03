import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contracts from '../config/contracts.json';
import './Dashboard.css';

// HandmadeNFT ABI
const ABI = [
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
];

const Dashboard = () => {
    const [account, setAccount] = useState('');
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const connectWallet = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);
            } catch (err) {
                setError('Cüzdan bağlantısı başarısız: ' + err.message);
            }
        };

        connectWallet();
    }, []);

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!account) return;

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(
                    contracts.sepolia.handmadeNFT,
                    ABI,
                    provider
                );

                const balance = await contract.balanceOf(account);
                const nftPromises = [];

                for (let i = 0; i < balance; i++) {
                    const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                    const uri = await contract.tokenURI(tokenId);
                    nftPromises.push({
                        id: tokenId.toString(),
                        uri
                    });
                }

                const nftsData = await Promise.all(nftPromises);
                setNfts(nftsData);
            } catch (err) {
                setError('NFT\'ler yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [account]);

    if (!account) {
        return (
            <div className="dashboard">
                <h1>Dashboard</h1>
                <p className="connect-wallet">Lütfen MetaMask'ı bağlayın.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            
            <div className="wallet-info">
                <h2>Cüzdan Bilgileri</h2>
                <p>Adres: {account}</p>
            </div>

            <div className="nft-collection">
                <h2>NFT Koleksiyonum</h2>
                
                {nfts.length === 0 ? (
                    <p className="no-nfts">Henüz NFT'niz bulunmuyor.</p>
                ) : (
                    <div className="nft-grid">
                        {nfts.map((nft) => (
                            <div key={nft.id} className="nft-card">
                                <div className="nft-image">
                                    {/* IPFS URI'den resim yükleme işlemi burada yapılacak */}
                                    <div className="placeholder-image">NFT #{nft.id}</div>
                                </div>
                                <div className="nft-info">
                                    <h3>NFT #{nft.id}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 