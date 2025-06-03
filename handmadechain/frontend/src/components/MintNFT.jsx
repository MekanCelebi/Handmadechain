import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '@/services/ipfsService';
import { switchToSepolia } from '@/utils/networkUtils';
import contracts from '@/config/contracts.json';

const ABI = [
    "function mint(string memory tokenURI) public returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

const MintNFT = () => {
    const [account, setAccount] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tokenId, setTokenId] = useState(null);

    // Cüzdan bağlantısı
    const connectWallet = async () => {
        try {
            const provider = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            setAccount(provider[0]);
            await switchToSepolia();
        } catch (err) {
            setError('Cüzdan bağlantısı başarısız: ' + err.message);
        }
    };

    // Dosya seçildiğinde önizleme oluştur
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    // NFT Mint
    const mintNFT = async () => {
        if (!file || !productName || !description) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            // IPFS'e yükle
            const { imageHash, metadataHash, metadataURI } = await uploadToIPFS(file, {
                name: productName,
                description: description
            });

            // NFT Mint
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contracts.sepolia.handmadeNFT, ABI, signer);
            
            const tx = await contract.mint(metadataURI);
            const receipt = await tx.wait();
            
            // Token ID'yi al
            const event = receipt.events.find(e => e.event === 'Transfer');
            const newTokenId = event.args.tokenId.toString();
            
            setTokenId(newTokenId);
            setSuccess('NFT başarıyla mint edildi!');
            setFile(null);
            setPreview(null);
            setProductName('');
            setDescription('');
        } catch (err) {
            setError('NFT mint edilemedi: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Yeni Ürün Ekle</h2>
                
                {!account ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Ürün eklemek için önce cüzdanınızı bağlayın</p>
                        <button
                            onClick={connectWallet}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                        >
                            MetaMask'a Bağlan
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500">Bağlı Cüzdan</p>
                            <p className="font-mono text-sm text-gray-700">{account}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {preview ? (
                                    <div className="relative">
                                        <img 
                                            src={preview} 
                                            alt="Preview" 
                                            className="max-h-64 mx-auto rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Görsel Seç
                                        </label>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ürününüzün adını girin"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                    placeholder="Ürününüz hakkında detaylı bilgi verin"
                                />
                            </div>

                            <button
                                onClick={mintNFT}
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
                                    isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        İşlem Yapılıyor...
                                    </div>
                                ) : 'Ürün Ekle'}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600">{success}</p>
                    </div>
                )}
                
                {tokenId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">
                            NFT başarıyla oluşturuldu! Token ID: {tokenId}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MintNFT; 