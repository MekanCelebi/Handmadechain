import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="nav-brand">
                    <Link to="/">HandmadeChain</Link>
                </div>
                <div className="nav-links">
                    <Link to="/" className={isActive('/') ? 'active' : ''}>
                        Ana Sayfa
                    </Link>
                    <Link to="/mint" className={isActive('/mint') ? 'active' : ''}>
                        NFT Mint
                    </Link>
                    <Link to="/products" className={isActive('/products') ? 'active' : ''}>
                        Ürünler
                    </Link>
                    <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                        Dashboard
                    </Link>
                </div>
            </nav>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout; 