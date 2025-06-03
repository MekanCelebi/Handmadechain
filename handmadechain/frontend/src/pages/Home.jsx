import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <div className="hero">
                <h1>HandmadeChain'e Hoş Geldiniz</h1>
                <p>El yapımı ürünlerinizi NFT olarak satın alın ve satın</p>
                <div className="cta-buttons">
                    <Link to="/mint" className="cta-button primary">
                        NFT Mint Et
                    </Link>
                    <Link to="/products" className="cta-button secondary">
                        Ürünleri Keşfet
                    </Link>
                </div>
            </div>
            
            <div className="features">
                <div className="feature">
                    <h3>NFT Mint</h3>
                    <p>El yapımı ürünlerinizi NFT olarak mint edin</p>
                </div>
                <div className="feature">
                    <h3>Güvenli Alışveriş</h3>
                    <p>Escrow sistemi ile güvenli alışveriş yapın</p>
                </div>
                <div className="feature">
                    <h3>Koleksiyon</h3>
                    <p>Benzersiz el yapımı ürünlerin koleksiyonunu oluşturun</p>
                </div>
            </div>
        </div>
    );
};

export default Home; 