// ============================================================
// App.js — Şeffaf Bağış Takip Platformu Frontend Kodu
// ============================================================
//
// Bu dosya React ile yazılmış frontend uygulamasıdır.
// ethers.js kütüphanesi aracılığıyla MetaMask üzerinden
// Ethereum Sepolia ağındaki akıllı kontratla iletişim kurar.
//
// Kullanılan Kütüphaneler:
// - React (useState): Ekrandaki verileri yönetmek için
// - ethers.js v6: Blokzincirle iletişim için
//
// Kurulum:
// npm install ethers
// ============================================================

import { useState } from "react";
import { ethers } from "ethers";

// ⚠️ Kendi kontratınızı deploy ettiyseniz adresi değiştirin!
const KONTRAT_ADRESI = "KONTRAT_ADRESI";

// Kontratın ABI'si — Remix'ten kopyalandı (JSON formatı)
// ABI: Kontratın hangi fonksiyonları olduğunu ve
//      nasıl çağrılacağını tanımlayan arayüz belgesi
const ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "bagisci", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "miktar", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "aciklama", "type": "string" }
    ],
    "name": "BagisAlindi",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "alici", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "miktar", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "sebep", "type": "string" }
    ],
    "name": "OdemeYapildi",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "string", "name": "aciklama", "type": "string" }],
    "name": "bagisYap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address payable", "name": "alici", "type": "address" },
      { "internalType": "uint256", "name": "miktar", "type": "uint256" },
      { "internalType": "string", "name": "sebep", "type": "string" }
    ],
    "name": "odemeYap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "bagislar",
    "outputs": [
      { "internalType": "address", "name": "bagisci", "type": "address" },
      { "internalType": "uint256", "name": "miktar", "type": "uint256" },
      { "internalType": "string", "name": "aciklama", "type": "string" },
      { "internalType": "uint256", "name": "zaman", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bakiyeGor",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tumBagislariGor",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "bagisci", "type": "address" },
          { "internalType": "uint256", "name": "miktar", "type": "uint256" },
          { "internalType": "string", "name": "aciklama", "type": "string" },
          { "internalType": "uint256", "name": "zaman", "type": "uint256" }
        ],
        "internalType": "struct BagisTakip.Bagis[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "yonetici",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  // useState: React'ta ekranda gösterilen verileri yönetir
  // Değer değişince ekran otomatik güncellenir
  const [hesap, setHesap] = useState("");           // Bağlı cüzdan adresi
  const [bakiye, setBakiye] = useState("0");        // Kontrat bakiyesi
  const [bagislar, setBagislar] = useState([]);     // Bağış listesi
  const [bagisAciklama, setBagisAciklama] = useState("");
  const [bagisMiktar, setBagisMiktar] = useState("");
  const [odemeAlici, setOdemeAlici] = useState("");
  const [odemeMiktar, setOdemeMiktar] = useState("");
  const [odemeSebep, setOdemeSebep] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  /**
   * MetaMask ile bağlantı kurar.
   * Aynı zamanda Sepolia ağına otomatik geçiş sağlar.
   */
  async function cuzdaniBagla() {
    if (!window.ethereum) {
      alert("MetaMask bulunamadı! Lütfen MetaMask yükleyin.");
      return;
    }
    try {
      // Sepolia ağına otomatik geç (chainId: 0xaa36a7 = 11155111)
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (e) {
      console.log("Ağ değiştirme hatası:", e);
    }
    // MetaMask'tan hesap erişimi iste
    const hesaplar = await window.ethereum.request({ method: "eth_requestAccounts" });
    setHesap(hesaplar[0]);
    await verileriYukle(hesaplar[0]);
  }

  /**
   * Kontrat bakiyesini ve bağış listesini blokzincirden çeker.
   * Bu işlemler "okuma" işlemidir, ETH gerektirmez.
   */
  async function verileriYukle(adres) {
    try {
      // BrowserProvider: MetaMask üzerinden blokzincire bağlanır
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Contract: Kontrat adresi ve ABI ile kontrat nesnesi oluşturur
      const kontrat = new ethers.Contract(KONTRAT_ADRESI, ABI, provider);

      // Bakiyeyi oku (wei → ETH dönüşümü yapılır)
      const b = await kontrat.bakiyeGor();
      setBakiye(ethers.formatEther(b));

      // Tüm bağışları oku
      const liste = await kontrat.tumBagislariGor();
      setBagislar(liste);
    } catch (e) {
      console.log("Veri yükleme hatası:", e.message);
    }
  }

  /**
   * Bağış gönderir.
   * Bu işlem "yazma" işlemidir, gas ücreti gerektirir.
   * MetaMask onay penceresi açılır.
   */
  async function bagisYap() {
    if (!bagisMiktar || !bagisAciklama) {
      setMesaj("Miktar ve açıklama giriniz!");
      return;
    }
    setYukleniyor(true);
    setMesaj("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // getSigner: İşlemi imzalamak için MetaMask'tan yetki alır
      const imzalayan = await provider.getSigner();
      const kontrat = new ethers.Contract(KONTRAT_ADRESI, ABI, imzalayan);

      // parseEther: "0.001" ETH değerini wei'ye çevirir
      const tx = await kontrat.bagisYap(bagisAciklama, {
        value: ethers.parseEther(bagisMiktar)
      });
      // tx.wait(): İşlemin blokzincire yazılmasını bekler
      await tx.wait();

      setMesaj("Bağış başarıyla gönderildi!");
      setBagisMiktar("");
      setBagisAciklama("");
      await verileriYukle(hesap);
    } catch (e) {
      setMesaj("Hata: " + e.message);
    }
    setYukleniyor(false);
  }

  /**
   * Kontrattan ödeme yapar.
   * Sadece yönetici (deploy eden kişi) çağırabilir.
   * Başkası çağırırsa kontrat hata verir.
   */
  async function odemeYap() {
    if (!odemeAlici || !odemeMiktar || !odemeSebep) {
      setMesaj("Tüm alanları doldurunuz!");
      return;
    }
    setYukleniyor(true);
    setMesaj("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const imzalayan = await provider.getSigner();
      const kontrat = new ethers.Contract(KONTRAT_ADRESI, ABI, imzalayan);
      const tx = await kontrat.odemeYap(
        odemeAlici,
        ethers.parseEther(odemeMiktar),
        odemeSebep
      );
      await tx.wait();
      setMesaj("Ödeme başarıyla yapıldı!");
      setOdemeAlici("");
      setOdemeMiktar("");
      setOdemeSebep("");
      await verileriYukle(hesap);
    } catch (e) {
      setMesaj("Hata: " + e.message);
    }
    setYukleniyor(false);
  }

  // ============================================================
  // Arayüz (JSX)
  // ============================================================
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial", padding: 20 }}>
      <h1 style={{ color: "#2c3e50" }}>Şeffaf Bağış Takip Platformu</h1>

      {/* MetaMask bağlantı butonu — bağlıysa adres gösterir */}
      {!hesap ? (
        <button onClick={cuzdaniBagla} style={butonStil("#3498db")}>
          MetaMask ile Bağlan
        </button>
      ) : (
        <p style={{ color: "green" }}>✅ Bağlı: {hesap.slice(0, 6)}...{hesap.slice(-4)}</p>
      )}

      {/* Kontrat bakiyesi */}
      <div style={kartStil}>
        <h2>Kontrat Bakiyesi</h2>
        <p style={{ fontSize: 28, fontWeight: "bold", color: "#27ae60" }}>{bakiye} ETH</p>
      </div>

      {/* Bağış formu */}
      <div style={kartStil}>
        <h2>Bağış Yap</h2>
        <input
          placeholder="Açıklama (örn: deprem yardımı)"
          value={bagisAciklama}
          onChange={e => setBagisAciklama(e.target.value)}
          style={inputStil}
        />
        <input
          placeholder="Miktar (ETH, örn: 0.001)"
          value={bagisMiktar}
          onChange={e => setBagisMiktar(e.target.value)}
          style={inputStil}
        />
        <button onClick={bagisYap} disabled={yukleniyor} style={butonStil("#27ae60")}>
          {yukleniyor ? "İşleniyor..." : "Bağış Gönder"}
        </button>
      </div>

      {/* Ödeme formu — sadece yönetici kullanabilir */}
      <div style={kartStil}>
        <h2>Ödeme Yap (Sadece Yönetici)</h2>
        <input
          placeholder="Alıcı adresi (0x...)"
          value={odemeAlici}
          onChange={e => setOdemeAlici(e.target.value)}
          style={inputStil}
        />
        <input
          placeholder="Miktar (ETH)"
          value={odemeMiktar}
          onChange={e => setOdemeMiktar(e.target.value)}
          style={inputStil}
        />
        <input
          placeholder="Sebep"
          value={odemeSebep}
          onChange={e => setOdemeSebep(e.target.value)}
          style={inputStil}
        />
        <button onClick={odemeYap} disabled={yukleniyor} style={butonStil("#e74c3c")}>
          {yukleniyor ? "İşleniyor..." : "Ödeme Yap"}
        </button>
      </div>

      {/* Hata veya başarı mesajı */}
      {mesaj && (
        <div style={{ padding: 12, background: "#f0f0f0", borderRadius: 8, marginTop: 16 }}>
          {mesaj}
        </div>
      )}

      {/* Bağış listesi */}
      <div style={kartStil}>
        <h2>Tüm Bağışlar ({bagislar.length})</h2>
        {bagislar.length === 0 ? (
          <p style={{ color: "#999" }}>Henüz bağış yok.</p>
        ) : (
          bagislar.map((b, i) => (
            <div key={i} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
              <p><strong>Bağışçı:</strong> {b.bagisci.slice(0, 6)}...{b.bagisci.slice(-4)}</p>
              <p><strong>Miktar:</strong> {ethers.formatEther(b.miktar)} ETH</p>
              <p><strong>Açıklama:</strong> {b.aciklama}</p>
              <p><strong>Zaman:</strong> {new Date(Number(b.zaman) * 1000).toLocaleString("tr-TR")}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stil sabitleri
// ============================================================

const kartStil = {
  background: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 20,
  marginTop: 20
};

const inputStil = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  boxSizing: "border-box"
};

const butonStil = (renk) => ({
  background: renk,
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 15
});

export default App;
