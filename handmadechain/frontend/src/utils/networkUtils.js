export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_NETWORK = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'SEP',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const switchToSepolia = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
    } catch (switchError) {
        // Eğer ağ yoksa, eklemeyi dene
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [SEPOLIA_NETWORK],
                });
            } catch (addError) {
                throw new Error('Sepolia ağı eklenemedi');
            }
        } else {
            throw new Error('Ağ değiştirilemedi');
        }
    }
}; 