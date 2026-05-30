# ⚡ FinUp — Küsürat Yuvarlama ve Otomatik Fon Dağıtım Platformu

Harcamalarınızın küsüratlarını otomatik olarak yuvarlayarak, risk profilinize uygun yatırım sepetlerine dönüştüren akıllı Fintech simülasyon platformu.

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js, Express.js |
| Veritabanı | PostgreSQL 15 |
| Cache & Queue | Redis 7 (Mesaj Kuyruğu + In-Memory Bakiye Takibi) |
| Frontend | React 18, Vite 5, Chart.js, Lucide Icons |
| Altyapı | Docker, Docker Compose |

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) yüklü ve çalışır durumda olmalıdır.
- Başka hiçbir kurulum (Node.js, PostgreSQL, Redis vs.) gerekmez.

### Adımlar

```bash
# 1. Repoyu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/FinUp.git

# 2. Proje dizinine girin
cd FinUp

# 3. Tek komutla tüm sistemi başlatın
docker compose up --build -d
```

İlk çalıştırmada Docker gerekli imajları indirecek ve servisleri derleyecektir (2-5 dakika sürebilir).

### Erişim Adresleri

| Servis | URL |
|--------|-----|
| 🎨 Dashboard (Arayüz) | [http://localhost:3000](http://localhost:3000) |
| 🔌 Backend API | [http://localhost:5000/health](http://localhost:5000/health) |

## 📋 Kullanım

1. **Harcama Simüle Et:** Dashboard'daki "Sanal Kart Harcama Simülatörü" panelinden tutar ve işyeri girerek harcama yapın.
2. **Asenkron Logları İzle:** Sağ taraftaki terminal panelinde Redis kuyruğunun ve Worker'ın her adımını canlı izleyin.
3. **Yatırım Ayarlarını Değiştir:** Risk profilini (Muhafazakar / Dengeli / Agresif), tetik limitini ve tam yuvarlama miktarını ayarlayın.
4. **Portföyü Görüntüle:** Havuzdaki birikim limite ulaştığında otomatik alım yapılır ve portföy grafiği güncellenir.

## 🧪 Test Senaryoları

| Senaryo | Açıklama |
|---------|----------|
| Standart Yuvarlama | 64.30 TL harcama → 5.70 TL küsürat havuza eklenir |
| Tam 10'luk Harcama | 60.00 TL harcama → Sabit 2.00 TL havuza eklenir |
| Yetersiz Bakiye | Bakiye yetersizse yuvarlama iptal edilir, hesap eksiye düşmez |
| Limit Aşımı | Havuz 50 TL'yi aştığında risk profiline göre otomatik yatırım yapılır |

## 🔧 Yönetim Komutları

```bash
# Servisleri durdur
docker compose down

# Servisleri durdur ve verileri temizle
docker compose down -v

# Logları izle
docker logs finup-backend -f
docker logs finup-frontend -f
```

## 📐 Mimari

```
Kullanıcı ──► Express API ──► Redis Queue (RPUSH)
                                    │
                              Worker (BLPOP)
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                 Bakiye Kontrolü          Redis INCRBYFLOAT
                  (PostgreSQL)           (Havuz Bakiye Takibi)
                        │                       │
                        │              Limit Aşıldı mı?
                        │                       │
                        ▼                       ▼
                  round_up_pool          Fon Dağıtım Motoru
                   (PENDING)            (Risk Profiline Göre)
                                              │
                                              ▼
                                        user_portfolio
                                         (INVESTED)
```

---

**FinUp** — Mühendislik Projesi | Node.js • Express • PostgreSQL • Redis • React • Docker
