import { useState, useEffect } from "react";
import { ethers } from "ethers";

const KONTRAT_ADRESI = "0xFA8a24a6E5Cc549360ea138527fF1562D663D7c4";

const ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "bagisci",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "miktar",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "aciklama",
				"type": "string"
			}
		],
		"name": "BagisAlindi",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "alici",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "miktar",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "sebep",
				"type": "string"
			}
		],
		"name": "OdemeYapildi",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "aciklama",
				"type": "string"
			}
		],
		"name": "bagisYap",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "alici",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "miktar",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "sebep",
				"type": "string"
			}
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bagislar",
		"outputs": [
			{
				"internalType": "address",
				"name": "bagisci",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "miktar",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "aciklama",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "zaman",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bakiyeGor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tumBagislariGor",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "bagisci",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "miktar",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "aciklama",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "zaman",
						"type": "uint256"
					}
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
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

function App() {
  const [hesap, setHesap] = useState("");
  const [bakiye, setBakiye] = useState("0");
  const [bagislar, setBagislar] = useState([]);
  const [bagisAciklama, setBagisAciklama] = useState("");
  const [bagisMiktar, setBagisMiktar] = useState("");
  const [odemeAlici, setOdemeAlici] = useState("");
  const [odemeMiktar, setOdemeMiktar] = useState("");
  const [odemeSebep, setOdemeSebep] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  async function cuzdaniBagla() {
    if (!window.ethereum) {
      alert("MetaMask bulunamadı!");
      return;
    }
    const hesaplar = await window.ethereum.request({ method: "eth_requestAccounts" });
    setHesap(hesaplar[0]);
    await verileriYukle(hesaplar[0]);
  }

  async function verileriYukle(adres) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const kontrat = new ethers.Contract(KONTRAT_ADRESI, ABI, provider);
    const b = await kontrat.bakiyeGor();
    setBakiye(ethers.formatEther(b));
    const liste = await kontrat.tumBagislariGor();
    setBagislar(liste);
  } catch (e) {
    console.log("Veri yükleme hatası:", e.message);
  }
}

  async function bagisYap() {
    if (!bagisMiktar || !bagisAciklama) {
      setMesaj("Miktar ve açıklama giriniz!");
      return;
    }
    setYukleniyor(true);
    setMesaj("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const imzalayan = await provider.getSigner();
      const kontrat = new ethers.Contract(KONTRAT_ADRESI, ABI, imzalayan);
      const tx = await kontrat.bagisYap(bagisAciklama, {
        value: ethers.parseEther(bagisMiktar)
      });
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

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial", padding: 20 }}>
      <h1 style={{ color: "#2c3e50" }}>Şeffaf Bağış Takip Platformu</h1>

      {!hesap ? (
        <button onClick={cuzdaniBagla} style={butonStil("#3498db")}>
          MetaMask ile Bağlan
        </button>
      ) : (
        <p style={{ color: "green" }}>✅ Bağlı: {hesap.slice(0, 6)}...{hesap.slice(-4)}</p>
      )}

      <div style={kartStil}>
        <h2>Kontrat Bakiyesi</h2>
        <p style={{ fontSize: 28, fontWeight: "bold", color: "#27ae60" }}>{bakiye} ETH</p>
      </div>

      <div style={kartStil}>
        <h2>Bağış Yap</h2>
        <input
          placeholder="Açıklama (örn: deprem yardımı)"
          value={bagisAciklama}
          onChange={e => setBagisAciklama(e.target.value)}
          style={inputStil}
        />
        <input
          placeholder="Miktar (ETH)"
          value={bagisMiktar}
          onChange={e => setBagisMiktar(e.target.value)}
          style={inputStil}
        />
        <button onClick={bagisYap} disabled={yukleniyor} style={butonStil("#27ae60")}>
          {yukleniyor ? "İşleniyor..." : "Bağış Gönder"}
        </button>
      </div>

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

      {mesaj && (
        <div style={{ padding: 12, background: "#f0f0f0", borderRadius: 8, marginTop: 16 }}>
          {mesaj}
        </div>
      )}

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