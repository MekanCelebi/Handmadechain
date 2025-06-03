import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MintNFT from './components/MintNFT';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import './App.css';

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mint" element={<MintNFT />} />
                    <Route path="/products" element={<ProductsList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App; 