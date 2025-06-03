import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import contracts from '../config/contracts.json';
import EscrowInteraction from '../components/EscrowInteraction';
import './ProductDetail.css';

// HandmadeNFT ABI
const ABI = [
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)"
];

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(
                    contracts.sepolia.handmadeNFT,
                    ABI,
                    provider
                );

                const uri = await contract.tokenURI(id);
                const owner = await contract.ownerOf(id);

                setProduct({
                    id,
                    uri,
                    owner
                });
            } catch (err) {
                setError('Ürün bilgileri yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!product) {
        return <div className="error">Ürün bulunamadı.</div>;
    }

    return (
        <div className="product-detail">
            <div className="product-content">
                <div className="product-image">
                    {/* IPFS URI'den resim yükleme işlemi burada yapılacak */}
                    <div className="placeholder-image">NFT #{product.id}</div>
                </div>
                
                <div className="product-info">
                    <h1>NFT #{product.id}</h1>
                    <p className="owner">
                        Sahip: {product.owner.slice(0, 6)}...{product.owner.slice(-4)}
                    </p>
                    
                    <div className="product-actions">
                        <EscrowInteraction />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 