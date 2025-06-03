import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import contracts from '../config/contracts.json';
import './ProductsList.css';

// HandmadeNFT ABI
const ABI = [
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)"
];

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(
                    contracts.sepolia.handmadeNFT,
                    ABI,
                    provider
                );

                // Örnek olarak ilk 10 token'ı getir
                const productPromises = [];
                for (let i = 1; i <= 10; i++) {
                    try {
                        const uri = await contract.tokenURI(i);
                        const owner = await contract.ownerOf(i);
                        productPromises.push({
                            id: i,
                            uri,
                            owner
                        });
                    } catch (err) {
                        // Token yoksa veya hata varsa atla
                        continue;
                    }
                }

                const productsData = await Promise.all(productPromises);
                setProducts(productsData);
            } catch (err) {
                setError('Ürünler yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="products-list">
            <h1>Ürünler</h1>
            
            {products.length === 0 ? (
                <p className="no-products">Henüz ürün bulunmuyor.</p>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <Link 
                            to={`/products/${product.id}`} 
                            key={product.id}
                            className="product-card"
                        >
                            <div className="product-image">
                                {/* IPFS URI'den resim yükleme işlemi burada yapılacak */}
                                <div className="placeholder-image">NFT #{product.id}</div>
                            </div>
                            <div className="product-info">
                                <h3>NFT #{product.id}</h3>
                                <p className="owner">
                                    Sahip: {product.owner.slice(0, 6)}...{product.owner.slice(-4)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsList; 