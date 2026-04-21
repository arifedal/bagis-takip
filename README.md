# 🔗 Şeffaf Bağış ve Yardım Takip Platformu

Blokzincir teknolojisi kullanılarak geliştirilen bu platform, bağışların bağışçıdan son kullanıcıya kadar şeffaf biçimde takip edilmesini sağlar. Ethereum Sepolia test ağında çalışan akıllı kontrat sayesinde tüm işlemler herkese açık ve değiştirilemez şekilde kaydedilir.

---

## 📌 Proje Hakkında

Geleneksel yardım kuruluşlarında para akışı çoğu zaman görünmezdir. Bu proje, akıllı kontratlar aracılığıyla:
- Bağışların blokzincire kaydedilmesini,
- Kontrat bakiyesinin herkese açık görünmesini,
- Ödemelerin yalnızca yönetici tarafından yapılabilmesini,
- Tüm işlemlerin Etherscan üzerinden doğrulanabilmesini sağlar.

---

## 🛠️ Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Akıllı Kontrat | Solidity (EVM: London, v0.8.19) |
| Geliştirme & Deploy | Remix IDE |
| Test Ağı | Ethereum Sepolia |
| Frontend | React.js |
| Blokzincir Bağlantısı | ethers.js v6 |
| Cüzdan | MetaMask |

---

## 📋 Kurulum Gereksinimleri

### 1. Node.js
React uygulamasını çalıştırmak için gereklidir.

- 🔗 https://nodejs.org adresinden **LTS** sürümünü indirin ve kurun.
- Kurulumu doğrulamak için terminalde şunu çalıştırın:
```bash
node --version
```
`v18.x.x` veya üzeri bir sürüm görünmelidir.

### 2. MetaMask
Ethereum cüzdanı ve ağ bağlantısı için gereklidir.

- 🔗 https://metamask.io/download adresinden tarayıcı eklentisini indirin.
- Kurulum sırasında yeni cüzdan oluştur veya mevcut cüzdanı import edin.
- **Seed phrase'inizi (12 kelime) mutlaka güvenli bir yere kaydedin.**

### 3. Sepolia Test ETH
İşlem yapabilmek için test ağında ETH gerekmektedir. Aşağıdaki faucet'lerden ücretsiz alınabilir:

- 🔗 https://cloud.google.com/application/web3/faucet/ethereum/sepolia (Google hesabı gerekli)
- 🔗 https://faucets.chain.link/sepolia (Chainlink faucet)

---

## 🚀 Projeyi Lokal Ortamda Çalıştırma

### Adım 1 — Repoyu klonla
```bash
git clone https://github.com/KULLANICI_ADIN/bagis-takip.git
cd bagis-takip
```

### Adım 2 — Bağımlılıkları yükle
```bash
npm install
```

### Adım 3 — Uygulamayı başlat
```bash
npm start
```
Tarayıcıda otomatik olarak `http://localhost:3000` açılır.

---

## ⚙️ Kontrat Adresi Değiştirme (Kendi Kontratını Deploy Etmek İsteyenler İçin)

Kendi kontratınızı deploy etmek istiyorsanız `src/App.js` dosyasında şu satırı güncelleyin:

```javascript
const KONTRAT_ADRESI = "SIZIN_KONTRAT_ADRESINIZ";
```

Kontratı deploy etmek için:
1. 🔗 https://remix.ethereum.org adresine gidin
2. `BagisTakip.sol` dosyasını oluştur ve kontrat kodunu yapıştırın
3. Compiler ayarları: Solidity `0.8.19`, EVM Version: `london`
4. Deploy & Run sekmesinde Environment: `Injected Provider - MetaMask` seçin
5. MetaMask'ta Sepolia ağını seçin
6. "Deploy & Verify" butonuna basın ve MetaMask'tan onaylayın
7. Deployed Contracts bölümünden yeni kontrat adresini kopyalayın
8. `App.js` dosyasındaki `KONTRAT_ADRESI` değişkenini güncelleyin

---

## 🧪 Test Etme

1. Terminali açın ve `npm start` yazarak uygulamayı başlatın.
2. MetaMask'ta **Sepolia** ağını seçin
3. Tarayıcıda `localhost:3000` açın
4. **"MetaMask ile Bağlan"** butonuna tıklayın, MetaMask'tan onaylayın
5. Açıklama ve miktar (örn: `0.001`) girerek **"Bağış Gönder"** butonuna basın
6. MetaMask onay penceresini onaylayın, işlem tamamlanınca bağış listesinde görünecektir
7. İşlemi Etherscan'da doğrulayabilirsiniz: https://sepolia.etherscan.io

---

## 🔍 Canlı Kontrat

Sepolia ağındaki kontrat adresi:
```
0xfa8a24a6e5cc549360ea138527ff1562d663d7c4
```

Etherscan üzerinden tüm işlemleri görüntüle:
🔗 https://sepolia.etherscan.io/address/0xfa8a24a6e5cc549360ea138527ff1562d663d7c4

---

## 📁 Proje Yapısı

```
bagis-takip/
├── public/
│   └── index.html
├── src/
│   └── App.js          ← Ana React bileşeni, tüm frontend kodu burada
├── contracts/
│   └── BagisTakip.sol  ← Solidity akıllı kontrat kodu
├── README.md
└── package.json
```
