import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import contracts from '@/config/contracts.json';

// Escrow ABI - sadece ihtiyacımız olan fonksiyonlar
const ABI = [
    "function confirmDelivery() public",
    "function cancel() public",
    "function buyer() public view returns (address)",
    "function seller() public view returns (address)",
    "function state() public view returns (uint8)"
];

const EscrowInteraction = () => {
    const [account, setAccount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [orderState, setOrderState] = useState(null);

    // Kontrat adresi - Sepolia test ağından config'den al
    const contractAddress = contracts.sepolia.escrow;

    // MetaMask bağlantısı
    const connectWallet = async () => {
        try {
            const provider = await detectEthereumProvider();
            
            if (provider) {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                setAccount(accounts[0]);
                setError('');

                // Ağ kontrolü
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== '0xaa36a7') { // Sepolia chainId
                    setError('Lütfen Sepolia test ağına geçin!');
                }
            } else {
                setError('MetaMask yüklü değil!');
            }
        } catch (err) {
            setError('Cüzdan bağlantısı başarısız: ' + err.message);
        }
    };

    // Sipariş durumunu kontrol et
    const checkOrderState = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, ABI, provider);
            const state = await contract.state();
            setOrderState(state.toString());
        } catch (err) {
            console.error('Sipariş durumu kontrol edilemedi:', err);
        }
    };

    // Ürün satın alma
    const buyProduct = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // 0.01 ETH gönder
            const tx = await signer.sendTransaction({
                to: contractAddress,
                value: ethers.utils.parseEther('0.01')
            });
            
            await tx.wait();
            setSuccess('Ödeme başarıyla gönderildi!');
            checkOrderState();
        } catch (err) {
            setError('Ödeme gönderilemedi: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Teslimat onayı
    const confirmDelivery = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ABI, signer);
            
            const tx = await contract.confirmDelivery();
            await tx.wait();
            
            setSuccess('Teslimat onaylandı!');
            checkOrderState();
        } catch (err) {
            setError('Teslimat onaylanamadı: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Sipariş iptali
    const cancelOrder = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ABI, signer);
            
            const tx = await contract.cancel();
            await tx.wait();
            
            setSuccess('Sipariş iptal edildi!');
            checkOrderState();
        } catch (err) {
            setError('Sipariş iptal edilemedi: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Ağ değişikliğini dinle
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== '0xaa36a7') {
                    setError('Lütfen Sepolia test ağına geçin!');
                } else {
                    setError('');
                }
            });
        }
    }, []);

    // Sipariş durumunu periyodik olarak kontrol et
    useEffect(() => {
        if (account) {
            checkOrderState();
            const interval = setInterval(checkOrderState, 10000); // Her 10 saniyede bir kontrol et
            return () => clearInterval(interval);
        }
    }, [account]);

    return (
        <div className="escrow-interaction">
            <h2>Escrow İşlemleri</h2>
            
            {!account ? (
                <button onClick={connectWallet}>
                    MetaMask'a Bağlan
                </button>
            ) : (
                <div>
                    <p>Bağlı Cüzdan: {account}</p>
                    
                    <div className="button-group">
                        <button 
                            onClick={buyProduct}
                            disabled={isLoading}
                        >
                            {isLoading ? 'İşlem Yapılıyor...' : 'Ürün Satın Al (0.01 ETH)'}
                        </button>

                        {orderState === '1' && ( // Ödeme yapıldı durumu
                            <>
                                <button 
                                    onClick={confirmDelivery}
                                    disabled={isLoading}
                                >
                                    Teslimatı Onayla
                                </button>
                                <button 
                                    onClick={cancelOrder}
                                    disabled={isLoading}
                                >
                                    Siparişi İptal Et
                                </button>
                            </>
                        )}
                    </div>

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}
                    
                    {orderState && (
                        <p className="order-state">
                            Sipariş Durumu: {
                                orderState === '0' ? 'Beklemede' :
                                orderState === '1' ? 'Ödeme Yapıldı' :
                                orderState === '2' ? 'Tamamlandı' :
                                orderState === '3' ? 'İptal Edildi' :
                                'Bilinmiyor'
                            }
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EscrowInteraction; 