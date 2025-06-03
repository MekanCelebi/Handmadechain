import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export const uploadToIPFS = async (file, metadata) => {
    try {
        // API anahtarlarını kontrol et
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            throw new Error('Pinata API anahtarları bulunamadı. Lütfen .env dosyasını kontrol edin.');
        }

        console.log('API Keys:', {
            apiKey: PINATA_API_KEY.substring(0, 5) + '...',
            secretKey: PINATA_SECRET_KEY.substring(0, 5) + '...'
        });

        // Dosya kontrolü
        if (!file) {
            throw new Error('Dosya seçilmedi');
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            throw new Error('Dosya boyutu çok büyük. Maksimum 100MB olmalıdır.');
        }

        // Dosya yükleme
        const formData = new FormData();
        formData.append('file', file);

        console.log('Dosya yükleniyor...', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        const fileResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('Dosya yükleme yanıtı:', fileResponse.data);

        if (!fileResponse.data || !fileResponse.data.IpfsHash) {
            throw new Error('Dosya yükleme başarısız: IPFS hash alınamadı');
        }

        const imageHash = fileResponse.data.IpfsHash;
        const imageURI = `ipfs://${imageHash}`;

        console.log('Metadata hazırlanıyor...', {
            name: metadata.name,
            description: metadata.description,
            imageURI
        });

        // Metadata hazırla
        const metadataToUpload = {
            name: metadata.name,
            description: metadata.description,
            image: imageURI,
            attributes: [
                {
                    trait_type: "Kategori",
                    value: "El Yapımı"
                }
            ]
        };

        // Metadata yükleme
        console.log('Metadata yükleniyor...');
        const metadataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadataToUpload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            }
        );

        console.log('Metadata yükleme yanıtı:', metadataResponse.data);

        if (!metadataResponse.data || !metadataResponse.data.IpfsHash) {
            throw new Error('Metadata yükleme başarısız: IPFS hash alınamadı');
        }

        const metadataHash = metadataResponse.data.IpfsHash;
        const metadataURI = `ipfs://${metadataHash}`;

        console.log('Yükleme başarılı:', {
            imageHash,
            metadataHash,
            metadataURI
        });

        return {
            imageHash,
            metadataHash,
            metadataURI
        };
    } catch (error) {
        console.error('IPFS yükleme hatası detayları:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });

        if (error.response) {
            // Pinata API'den gelen hata mesajını işle
            const errorMessage = error.response.data?.error?.details || 
                               error.response.data?.error?.message || 
                               error.response.data?.error || 
                               error.response.statusText;
            
            if (error.response.status === 401) {
                throw new Error('Pinata API anahtarları geçersiz. Lütfen API anahtarlarınızı kontrol edin.');
            } else if (error.response.status === 413) {
                throw new Error('Dosya boyutu çok büyük. Lütfen daha küçük bir dosya seçin.');
            } else {
                throw new Error(`IPFS yükleme hatası: ${errorMessage}`);
            }
        } else if (error.request) {
            throw new Error('IPFS sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        } else if (error.message) {
            throw new Error(`IPFS yükleme hatası: ${error.message}`);
        } else {
            throw new Error('Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
};

export const getIPFSGatewayUrl = (ipfsHash) => {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
}; 