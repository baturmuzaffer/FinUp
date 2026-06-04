# ⚡ FinUp — Küsürat Yuvarlama ve Otomatik Fon Dağıtım Platformu

**Tezsiz Yüksek Lisans Bitirme Projesi**

> Harcamalarınızın küsüratlarını otomatik olarak yuvarlayarak, risk profilinize uygun yatırım sepetlerine dönüştüren akıllı Fintech simülasyon platformu.

---

## İçindekiler

1. [Proje Hakkında](#1-proje-hakkında)
   - [Projenin Amacı ve Hedefi](#11-projenin-amacı-ve-hedefi)
   - [Problem Tanımı ve Motivasyon](#12-problem-tanımı-ve-motivasyon)
   - [Çözüm Yaklaşımı](#13-çözüm-yaklaşımı)
   - [Projenin Kapsamı](#14-projenin-kapsamı)
2. [Teknoloji Yığını (Tech Stack)](#2-teknoloji-yığını-tech-stack)
   - [Backend Teknolojileri](#21-backend-teknolojileri)
   - [Frontend Teknolojileri](#22-frontend-teknolojileri)
   - [Veritabanı ve Önbellek](#23-veritabanı-ve-önbellek)
   - [Altyapı ve Konteynerizasyon](#24-altyapı-ve-konteynerizasyon)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
   - [Genel Mimari Diyagram](#31-genel-mimari-diyagram)
   - [Katmanlı Mimari Yapı](#32-katmanlı-mimari-yapı)
   - [Asenkron İş Akışı (Async Pipeline)](#33-asenkron-iş-akışı-async-pipeline)
   - [Veri Akış Şeması](#34-veri-akış-şeması)
4. [Veritabanı Tasarımı](#4-veritabanı-tasarımı)
   - [ER Diyagramı ve Tablo İlişkileri](#41-er-diyagramı-ve-tablo-ilişkileri)
   - [Tablo Detayları](#42-tablo-detayları)
   - [Seed (Başlangıç) Verileri](#43-seed-başlangıç-verileri)
5. [Backend Mimarisi ve Modüller](#5-backend-mimarisi-ve-modüller)
   - [Dizin Yapısı](#51-dizin-yapısı)
   - [Uygulama Başlatma Süreci (Bootstrap)](#52-uygulama-başlatma-süreci-bootstrap)
   - [Veritabanı Bağlantı Yönetimi](#53-veritabanı-bağlantı-yönetimi)
   - [Redis Bağlantı Yönetimi](#54-redis-bağlantı-yönetimi)
   - [Mesaj Kuyruğu Sistemi (Queue)](#55-mesaj-kuyruğu-sistemi-queue)
   - [Küsürat Yuvarlama Motoru (Round-Up Engine)](#56-küsürat-yuvarlama-motoru-round-up-engine)
   - [Yatırım Dağıtım Motoru (Investment Engine)](#57-yatırım-dağıtım-motoru-investment-engine)
6. [API Endpoint Dokümantasyonu](#6-api-endpoint-dokümantasyonu)
7. [Frontend Mimarisi ve Bileşenler](#7-frontend-mimarisi-ve-bileşenler)
   - [Dizin Yapısı](#71-dizin-yapısı)
   - [Bileşen Mimarisi](#72-bileşen-mimarisi)
   - [State Yönetimi](#73-state-yönetimi)
   - [Gerçek Zamanlı Güncelleme Mekanizması](#74-gerçek-zamanlı-güncelleme-mekanizması)
   - [UI/UX Tasarım Kararları](#75-uiux-tasarım-kararları)
8. [Docker ve Konteynerizasyon](#8-docker-ve-konteynerizasyon)
   - [Docker Compose Servisleri](#81-docker-compose-servisleri)
   - [Servis Bağımlılık Grafiği](#82-servis-bağımlılık-grafiği)
   - [Volume Yönetimi](#83-volume-yönetimi)
9. [Kurulum ve Çalıştırma](#9-kurulum-ve-çalıştırma)
   - [Ön Gereksinimler](#91-ön-gereksinimler)
   - [Kurulum Adımları](#92-kurulum-adımları)
   - [Erişim Adresleri](#93-erişim-adresleri)
10. [Kullanım Kılavuzu](#10-kullanım-kılavuzu)
11. [Test Senaryoları](#11-test-senaryoları)
12. [Risk Profili ve Yatırım Dağıtım Algoritması](#12-risk-profili-ve-yatırım-dağıtım-algoritması)
13. [Güvenlik ve Veri Bütünlüğü](#13-güvenlik-ve-veri-bütünlüğü)
14. [Yönetim Komutları](#14-yönetim-komutları)
15. [Proje Dizin Yapısı](#15-proje-dizin-yapısı)
16. [Gelecek Geliştirmeler ve Katkıda Bulunma](#16-gelecek-geliştirmeler-ve-katkıda-bulunma)

---

## 1. Proje Hakkında

### 1.1 Projenin Amacı ve Hedefi

**FinUp**, bireylerin günlük harcamalarından oluşan küsürat (kuruş) miktarlarını otomatik olarak yuvarlayarak, bu birikimleri kullanıcının belirlediği risk profiline uygun yatırım araçlarına (kripto para, hisse senedi, altın, döviz) otomatik olarak yönlendiren bir **Fintech simülasyon platformudur**.

Projenin temel hedefleri şunlardır:

- **Mikro-Yatırım Otomasyonu:** Kullanıcıların farkında bile olmadan, her harcama işleminde küçük miktarlar biriktirerek yatırım yapmalarını sağlayan bir otomasyon sistemi geliştirmek.
- **Asenkron Mesaj Kuyruğu Mimarisi:** Redis tabanlı bir mesaj kuyruğu (Message Queue) sistemi kullanarak, harcama işlemlerinin yuvarlama ve yatırım süreçlerinden bağımsız olarak işlenmesini sağlayan asenkron bir mimari tasarlamak ve uygulamak.
- **Risk Bazlı Portföy Yönetimi:** Muhafazakar, Dengeli ve Agresif olmak üzere üç farklı risk profiline göre otomatik varlık dağıtım algoritması geliştirmek.
- **Gerçek Zamanlı İzleme:** Tüm asenkron süreçlerin (kuyruk işlemleri, yuvarlama hesaplamaları, yatırım dağıtımları) canlı olarak izlenebileceği bir dashboard arayüzü sunmak.
- **Konteynerize Dağıtım:** Docker ve Docker Compose kullanarak, tüm sistemin (veritabanı, önbellek, backend, frontend) tek bir komutla ayağa kaldırılabilmesini sağlamak.

### 1.2 Problem Tanımı ve Motivasyon

Türkiye'de ve dünyada bireysel yatırım oranları, özellikle genç nesil ve düşük-orta gelir grubunda oldukça düşüktür. Bunun başlıca nedenleri şunlardır:

1. **Düşük Tasarruf Alışkanlığı:** Birçok birey, yatırım yapmak için yeterli birikime sahip olmadığını düşünmektedir.
2. **Finansal Okuryazarlık Eksikliği:** Yatırım araçları hakkında bilgi eksikliği, bireyleri yatırım yapmaktan alıkoymaktadır.
3. **Psikolojik Eşik:** "Yatırım yapmak için büyük miktarlara ihtiyaç var" algısı, küçük miktarlarla başlamanın önünde bir engel oluşturmaktadır.
4. **Zaman ve Emek:** Manuel olarak yatırım yapmak, sürekli piyasa takibi ve karar verme süreci gerektirmektedir.

**Round-Up (Küsürat Yuvarlama)** modeli, bu sorunlara elegant bir çözüm sunmaktadır. Kullanıcının her harcamasında oluşan küsürat miktarlarını otomatik olarak yuvarlayarak biriktirmek ve belirli bir eşik değerine ulaşıldığında otomatik yatırıma dönüştürmek, yatırım sürecini tamamen otonom hale getirmektedir.

### 1.3 Çözüm Yaklaşımı

FinUp, aşağıdaki temel mühendislik prensiplerine dayanan bir çözüm sunmaktadır:

| Prensip | Uygulama |
|---------|----------|
| **Asenkron İşlem** | Harcama kaydı anında yapılır, yuvarlama ve yatırım işlemleri Redis kuyruğu üzerinden arka planda asenkron olarak gerçekleştirilir |
| **Atomik Veri Tutarlılığı** | PostgreSQL transaction'ları ile bakiye kontrolü ve güncelleme işlemleri atomik olarak yapılır (`BEGIN → SELECT FOR UPDATE → UPDATE → COMMIT`) |
| **In-Memory Hız** | Redis `INCRBYFLOAT` komutu ile havuz bakiyesi milisaniye düzeyinde güncellenir, yüksek okuma performansı sağlanır |
| **Olay Güdümlü Mimari** | Worker, `BLPOP` komutu ile kuyruğu blokaj modunda dinler; yeni iş geldiğinde otomatik olarak tetiklenir |
| **Konteynerizasyon** | Docker Compose ile tüm bağımlılıklar (PostgreSQL, Redis, Backend, Frontend) izole konteynerler içinde çalışır |

### 1.4 Projenin Kapsamı

Bu proje bir **simülasyon platformudur**. Gerçek banka entegrasyonları ve gerçek finansal işlemler içermemektedir. Projenin kapsamı şunları içerir:

- ✅ Sanal kart harcama simülasyonu
- ✅ Otomatik küsürat yuvarlama motoru
- ✅ Redis tabanlı asenkron mesaj kuyruğu
- ✅ Risk profiline dayalı otomatik yatırım dağıtımı
- ✅ Gerçek zamanlı log izleme paneli
- ✅ Portföy görselleştirme (Doughnut grafik)
- ✅ Docker ile tam konteynerize dağıtım
- ✅ Sistem sıfırlama (demo tekrarı için)
- ❌ Gerçek banka API entegrasyonu
- ❌ Gerçek borsa/kripto borsası bağlantısı
- ❌ Kullanıcı kimlik doğrulama (Authentication)
- ❌ Çoklu kullanıcı desteği (demo amaçlı tek kullanıcı)

---

## 2. Teknoloji Yığını (Tech Stack)

### 2.1 Backend Teknolojileri

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Node.js** | 20 (Alpine) | JavaScript runtime ortamı. Non-blocking I/O modeli sayesinde asenkron işlemler için idealdir |
| **Express.js** | 4.19.2 | Minimal ve esnek HTTP web framework'ü. RESTful API endpoint'lerinin tanımlanması için kullanılır |
| **ioredis** | 5.4.1 | Redis istemci kütüphanesi. `BLPOP`, `RPUSH`, `INCRBYFLOAT` gibi gelişmiş Redis komutlarını destekler |
| **pg (node-postgres)** | 8.11.5 | PostgreSQL istemci kütüphanesi. Connection pooling ve transaction desteği sunar |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing middleware'i. Frontend-Backend arası iletişimi mümkün kılar |

**Neden Node.js?**
Node.js'in event-driven, non-blocking I/O mimarisi, bu projede kritik öneme sahiptir. Backend aynı anda hem HTTP isteklerini karşılarken hem de Redis kuyruğunu dinleyen Worker döngüsünü çalıştırabilmektedir. Node.js'in tek iş parçacıklı (single-threaded) event loop'u, I/O-yoğun işlemler için yüksek performans sunar.

### 2.2 Frontend Teknolojileri

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **React** | 18.3.1 | Kullanıcı arayüzü bileşen kütüphanesi. Sanal DOM ile verimli güncelleme sağlar |
| **Vite** | 5.2.11 | Yeni nesil frontend build aracı. HMR (Hot Module Replacement) ile anlık geliştirme deneyimi sunar |
| **Chart.js** | 4.4.2 | Veri görselleştirme kütüphanesi. Portföy dağılımı için Doughnut grafik kullanılır |
| **react-chartjs-2** | 5.2.0 | Chart.js'in React sarmalayıcısı. Deklaratif grafik bileşenleri oluşturur |
| **Lucide React** | 0.379.0 | Modern SVG ikon kütüphanesi. 1000+ özelleştirilebilir ikon içerir |

**Neden React + Vite?**
React'in bileşen tabanlı mimarisi, dashboard gibi karmaşık arayüzlerin modüler olarak geliştirilmesini sağlar. Vite ise Webpack'e kıyasla çok daha hızlı geliştirme sunucusu başlatma süresi ve HMR performansı sunarak geliştirici deneyimini iyileştirir. ES Module tabanlı mimari sayesinde bağımlılık ağacı daha verimli yönetilir.

### 2.3 Veritabanı ve Önbellek

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **PostgreSQL** | 15 (Alpine) | İlişkisel veritabanı yönetim sistemi. ACID uyumlu transaction'lar ile veri bütünlüğü sağlar |
| **Redis** | 7 (Alpine) | In-memory veri yapı deposu. Mesaj kuyruğu ve havuz bakiyesi önbellekleme için kullanılır |

**PostgreSQL'in Rolü:**
- Kullanıcı bilgileri, yatırım profilleri, işlem geçmişi ve portföy verilerinin kalıcı (persistent) olarak saklanması
- ACID (Atomicity, Consistency, Isolation, Durability) uyumlu transaction'lar ile bakiye güncelleme işlemlerinde veri tutarlılığının garanti edilmesi
- `SELECT ... FOR UPDATE` kilitleme mekanizması ile eş zamanlı erişim durumlarında race condition önlenmesi

**Redis'in Çoklu Rolü:**
1. **Mesaj Kuyruğu (Message Queue):** `RPUSH` ile kuyruğa iş ekleme, `BLPOP` ile kuyruğu blokaj modunda dinleme
2. **In-Memory Bakiye Takibi:** `INCRBYFLOAT` ile havuz bakiyesinin atomik olarak güncellenmesi ve hızlı okunması
3. **Log Deposu:** İşlem loglarının `RPUSH` ile liste yapısında saklanması ve `LTRIM` ile son 100 kayıtla sınırlandırılması

### 2.4 Altyapı ve Konteynerizasyon

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **Docker** | Her bir servisin (PostgreSQL, Redis, Backend, Frontend) izole konteynerler içinde çalıştırılması |
| **Docker Compose** | Çoklu konteyner orkestrasyonu. Servis bağımlılıkları, ağ yapılandırması ve volume yönetimi |

---

## 3. Sistem Mimarisi

### 3.1 Genel Mimari Diyagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              FinUp Sistem Mimarisi                                   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌─────────────────┐         ┌───────────────────────────────────────────────────┐  │
│   │                 │  HTTP   │                  BACKEND (Node.js)                │  │
│   │   FRONTEND      │ ◄─────►│                                                   │  │
│   │   (React+Vite)  │  REST  │  ┌─────────────┐   ┌──────────────────────────┐   │  │
│   │                 │  API   │  │ Express.js  │   │  Queue Module            │   │  │
│   │  ┌───────────┐  │        │  │ Router      │   │  ┌──────────────────┐    │   │  │
│   │  │ Dashboard │  │        │  │             │   │  │ addToQueue()     │    │   │  │
│   │  │ Bileşeni  │  │        │  │ /api/spend  │──►│  │ (RPUSH)          │    │   │  │
│   │  ├───────────┤  │        │  │ /api/user   │   │  └──────────────────┘    │   │  │
│   │  │ Simülatör │  │        │  │ /api/logs   │   │  ┌──────────────────┐    │   │  │
│   │  ├───────────┤  │        │  │ /api/reset  │   │  │ Worker Loop      │    │   │  │
│   │  │ Terminal  │  │        │  └─────────────┘   │  │ (BLPOP)          │    │   │  │
│   │  │ Log Panel │  │        │                    │  │ ┌──────────────┐ │    │   │  │
│   │  ├───────────┤  │        │                    │  │ │Round-Up Eng. │ │    │   │  │
│   │  │ Portföy   │  │        │                    │  │ │Investment Eng│ │    │   │  │
│   │  │ Grafiği   │  │        │                    │  │ └──────────────┘ │    │   │  │
│   │  └───────────┘  │        │                    │  └──────────────────┘    │   │  │
│   └─────────────────┘        │                    └──────────────────────────┘   │  │
│     Port: 3000               │                                                   │  │
│                              └─────────┬──────────────────┬──────────────────────┘  │
│                                        │                  │         Port: 5000       │
│                              ┌─────────▼──────┐  ┌───────▼─────────┐                │
│                              │  PostgreSQL 15  │  │    Redis 7      │                │
│                              │                 │  │                 │                │
│                              │  • users        │  │  • Queue List   │                │
│                              │  • transactions │  │  • Pool Balance │                │
│                              │  • round_up_pool│  │  • Log List     │                │
│                              │  • portfolio    │  │                 │                │
│                              │  • profiles     │  │                 │                │
│                              └─────────────────┘  └─────────────────┘                │
│                                Port: 5432            Port: 6379                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Katmanlı Mimari Yapı

Proje, **üç katmanlı mimari (Three-Tier Architecture)** prensibine uygun olarak tasarlanmıştır:

```
┌─────────────────────────────────────────────────────┐
│            Sunum Katmanı (Presentation Tier)         │
│         React + Vite + Chart.js + Lucide Icons       │
│     Dashboard, Simülatör, Terminal, Portföy Grafiği  │
├─────────────────────────────────────────────────────┤
│              İş Mantığı Katmanı (Logic Tier)         │
│           Node.js + Express.js + ioredis + pg        │
│   Round-Up Engine, Investment Engine, Queue Worker   │
├─────────────────────────────────────────────────────┤
│             Veri Katmanı (Data Tier)                  │
│         PostgreSQL (Kalıcı) + Redis (Geçici)         │
│  Kullanıcı/İşlem/Portföy Verileri + Kuyruk/Önbellek │
└─────────────────────────────────────────────────────┘
```

**Katman Sorumlulukları:**

| Katman | Sorumluluk | Teknoloji |
|--------|------------|-----------|
| **Sunum Katmanı** | Kullanıcı arayüzü, veri görselleştirme, form yönetimi, gerçek zamanlı güncelleme | React 18, Vite 5, Chart.js, Lucide |
| **İş Mantığı Katmanı** | RESTful API, yuvarlama hesaplama, yatırım dağıtımı, kuyruk yönetimi, bakiye doğrulama | Express.js, ioredis, pg |
| **Veri Katmanı** | Kalıcı veri saklama (PostgreSQL), geçici veri ve kuyruk yönetimi (Redis) | PostgreSQL 15, Redis 7 |

### 3.3 Asenkron İş Akışı (Async Pipeline)

FinUp'ın en kritik mühendislik özelliği, harcama işlemlerinin **asenkron** olarak işlenmesidir. Bu akış aşağıdaki şekilde gerçekleşir:

```
   KULLANICI                    EXPRESS API                  REDIS QUEUE                 WORKER
   (Frontend)                   (HTTP Layer)                 (Message Broker)            (Background)
      │                              │                            │                          │
      │  1. POST /api/spend          │                            │                          │
      │  {amount: 64.30,             │                            │                          │
      │   merchant: "Starbucks"}     │                            │                          │
      │─────────────────────────────►│                            │                          │
      │                              │                            │                          │
      │                              │  2. INSERT INTO            │                          │
      │                              │     transactions           │                          │
      │                              │     (PostgreSQL)           │                          │
      │                              │                            │                          │
      │                              │  3. RPUSH                  │                          │
      │                              │     transaction_queue      │                          │
      │                              │───────────────────────────►│                          │
      │                              │                            │                          │
      │  4. HTTP 202 Accepted        │                            │                          │
      │◄─────────────────────────────│                            │                          │
      │  (İstemci beklemez!)         │                            │                          │
      │                              │                            │  5. BLPOP                │
      │                              │                            │     transaction_queue     │
      │                              │                            │◄─────────────────────────│
      │                              │                            │                          │
      │                              │                            │  6. Job verisi alındı    │
      │                              │                            │─────────────────────────►│
      │                              │                            │                          │
      │                              │                            │                          │  7. Round-Up
      │                              │                            │                          │     Hesaplama
      │                              │                            │                          │
      │                              │                            │                          │  8. Bakiye
      │                              │                            │                          │     Kontrolü
      │                              │                            │                          │     (PostgreSQL
      │                              │                            │                          │      FOR UPDATE)
      │                              │                            │                          │
      │                              │                            │  9. INCRBYFLOAT          │
      │                              │                            │◄─────────────────────────│
      │                              │                            │     pool:user:1          │
      │                              │                            │                          │
      │                              │                            │                          │  10. Limit
      │                              │                            │                          │      Kontrolü
      │                              │                            │                          │
      │                              │                            │                          │  11. (Eğer limit
      │                              │                            │                          │      aşıldıysa)
      │                              │                            │                          │      Fon Dağıtımı
      │                              │                            │                          │
```

**Bu asenkron yaklaşımın avantajları:**

1. **Düşük Gecikme (Low Latency):** Kullanıcı, harcama yaptığında HTTP 202 yanıtını anında alır. Yuvarlama ve yatırım hesaplamaları arka planda yapılır.
2. **Yük Dengeleme:** Yoğun harcama dönemlerinde (örn. hafta sonu alışveriş) işlemler kuyruğa alınarak sıralı ve güvenli şekilde işlenir.
3. **Hata İzolasyonu:** Worker'da oluşan bir hata, HTTP API'yi etkilemez. Worker otomatik olarak yeniden deneme yapar.
4. **Ölçeklenebilirlik:** Kuyruk yapısı sayesinde birden fazla Worker eklenebilir (horizontal scaling).

### 3.4 Veri Akış Şeması

Bir harcama işleminin baştan sona tüm veri akışı:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        HARCAMA İŞLEM AKIŞI                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. Kullanıcı 64.30 TL harcama simüle eder                               │
│     │                                                                      │
│     ▼                                                                      │
│  2. Express API → transactions tablosuna INSERT                            │
│     │                                                                      │
│     ▼                                                                      │
│  3. Redis RPUSH → transaction_queue listesine job eklenir                  │
│     │                                                                      │
│     ▼                                                                      │
│  4. HTTP 202 döner → Kullanıcı beklemez                                   │
│     │                                                                      │
│     ▼                                                                      │
│  5. Worker BLPOP → Kuyruktaki işi alır                                    │
│     │                                                                      │
│     ▼                                                                      │
│  6. Round-Up Engine:                                                       │
│     │  • 64.30 % 10 = 4.30                                                │
│     │  • roundUp = 10 - 4.30 = 5.70 TL                                    │
│     │                                                                      │
│     ▼                                                                      │
│  7. PostgreSQL Transaction (BEGIN):                                        │
│     │  • SELECT bank_balance FROM users FOR UPDATE → 2500.00 TL           │
│     │  • 2500.00 >= 5.70? → EVET (Yeterli bakiye)                         │
│     │  • UPDATE users SET bank_balance = 2494.30                           │
│     │  • INSERT INTO round_up_pool (5.70, 'PENDING')                      │
│     │  • COMMIT                                                            │
│     │                                                                      │
│     ▼                                                                      │
│  8. Redis INCRBYFLOAT pool:user:1 → 5.70 (yeni havuz bakiyesi)           │
│     │                                                                      │
│     ▼                                                                      │
│  9. Limit Kontrolü: 5.70 < 50.00 (tetik limiti)                          │
│     │  → Yatırım tetiklenmez, birikim devam eder                          │
│     │                                                                      │
│     ▼                                                                      │
│  ── TEKRARLANAN HARCAMALAR ──                                              │
│     │                                                                      │
│     ▼                                                                      │
│  10. Havuz bakiyesi 50.00 TL'yi aşar                                      │
│     │                                                                      │
│     ▼                                                                      │
│  11. Investment Engine tetiklenir:                                          │
│     │  • Risk profili: AGGRESSIVE                                          │
│     │  • %40 BTC → 20.00 TL ile 0.000006 BTC alınır                      │
│     │  • %20 ETH → 10.00 TL ile 0.000083 ETH alınır                      │
│     │  • %40 STOCK → 20.00 TL ile 0.040000 hisse alınır                  │
│     │  • user_portfolio güncellenir                                        │
│     │  • round_up_pool → status: 'INVESTED'                               │
│     │                                                                      │
│     ▼                                                                      │
│  12. Redis pool:user:1 → 0.00 (sıfırlanır)                               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Veritabanı Tasarımı

### 4.1 ER Diyagramı ve Tablo İlişkileri

```
┌─────────────────┐       1:1       ┌──────────────────────┐
│     users        │◄──────────────►│ investment_profiles   │
│─────────────────│                 │──────────────────────│
│ id (PK)         │                 │ id (PK)              │
│ name            │                 │ user_id (FK, UNIQUE) │
│ email (UNIQUE)  │                 │ risk_type            │
│ bank_balance    │                 │ trigger_limit        │
│ created_at      │                 │ exact_round_up       │
└────────┬────────┘                 │ updated_at           │
         │                          └──────────────────────┘
         │
         │ 1:N
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌───────────────────┐
│  transactions    │  │  user_portfolio    │
│─────────────────│  │───────────────────│
│ id (PK)         │  │ id (PK)           │
│ user_id (FK)    │  │ user_id (FK)      │
│ amount          │  │ asset_name        │
│ merchant        │  │ asset_type        │
│ created_at      │  │ quantity          │
└────────┬────────┘  │ total_invested    │
         │           │ average_cost      │
         │ 1:1       │ updated_at        │
         │           │ UNIQUE(user_id,   │
         │           │   asset_name)     │
         ▼           └───────────────────┘
┌─────────────────┐
│ round_up_pool    │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ transaction_id  │
│   (FK)          │
│ round_up_amount │
│ status          │
│ created_at      │
└─────────────────┘
```

### 4.2 Tablo Detayları

#### `users` — Kullanıcılar Tablosu

Sistemdeki kullanıcıların temel bilgilerini ve simüle edilmiş banka kartı bakiyesini tutar.

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `id` | `SERIAL` | `PRIMARY KEY` | Otomatik artan benzersiz tanımlayıcı |
| `name` | `VARCHAR(100)` | `NOT NULL` | Kullanıcının adı ve soyadı |
| `email` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Kullanıcının e-posta adresi (benzersiz) |
| `bank_balance` | `NUMERIC(12,2)` | `NOT NULL, DEFAULT 5000.00` | Simüle edilmiş banka kartı bakiyesi (TL) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Kayıt oluşturulma zamanı |

#### `investment_profiles` — Yatırım Profilleri Tablosu

Kullanıcının yatırım tercihlerini (risk profili, tetik limiti, tam yuvarlama miktarı) saklar. Her kullanıcının yalnızca bir profili olabilir (`user_id UNIQUE`).

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `id` | `SERIAL` | `PRIMARY KEY` | Otomatik artan benzersiz tanımlayıcı |
| `user_id` | `INTEGER` | `UNIQUE, REFERENCES users(id) ON DELETE CASCADE` | İlişkili kullanıcı (1:1 ilişki) |
| `risk_type` | `VARCHAR(20)` | `NOT NULL, CHECK IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'), DEFAULT 'MODERATE'` | Risk profili tipi |
| `trigger_limit` | `NUMERIC(10,2)` | `NOT NULL, DEFAULT 50.00` | Yatırım tetik limiti (TL) |
| `exact_round_up` | `NUMERIC(10,2)` | `NOT NULL, DEFAULT 2.00` | Tam 10'luk harcamalarda sabit yuvarlama miktarı (TL) |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Son güncelleme zamanı |

#### `transactions` — Harcama İşlemleri Tablosu

Kullanıcının yaptığı tüm simüle harcama işlemlerini kaydeder.

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `id` | `SERIAL` | `PRIMARY KEY` | İşlem benzersiz tanımlayıcısı |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | İşlemi yapan kullanıcı |
| `amount` | `NUMERIC(12,2)` | `NOT NULL` | Harcama tutarı (TL) |
| `merchant` | `VARCHAR(100)` | `NOT NULL` | İşyeri adı |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | İşlem zamanı |

#### `round_up_pool` — Küsürat Yuvarlama Havuzu Tablosu

Her harcama işlemine karşılık gelen yuvarlama kaydını tutar. İşlemin durumunu (`PENDING`, `INVESTED`, `FAILED_INSUFFICIENT`) takip eder.

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `id` | `SERIAL` | `PRIMARY KEY` | Havuz kaydı benzersiz tanımlayıcısı |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | İlişkili kullanıcı |
| `transaction_id` | `INTEGER` | `REFERENCES transactions(id) ON DELETE CASCADE` | İlişkili harcama işlemi |
| `round_up_amount` | `NUMERIC(10,2)` | `NOT NULL` | Yuvarlama miktarı (TL) |
| `status` | `VARCHAR(30)` | `NOT NULL, CHECK IN ('PENDING', 'INVESTED', 'FAILED_INSUFFICIENT'), DEFAULT 'PENDING'` | İşlem durumu |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Kayıt zamanı |

**Durum (Status) Açıklamaları:**
- `PENDING`: Yuvarlama yapıldı, havuzda birikiyor, henüz yatırıma dönüştürülmedi
- `INVESTED`: Havuz limiti aşıldı ve bu küsürat miktarı yatırıma dönüştürüldü
- `FAILED_INSUFFICIENT`: Kullanıcının banka bakiyesi yetersiz olduğu için yuvarlama iptal edildi

#### `user_portfolio` — Kullanıcı Portföy Tablosu

Kullanıcının otomatik yatırımlar sonucu sahip olduğu varlıkları ve miktarlarını saklar.

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `id` | `SERIAL` | `PRIMARY KEY` | Portföy kaydı benzersiz tanımlayıcısı |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | İlişkili kullanıcı |
| `asset_name` | `VARCHAR(50)` | `NOT NULL` | Varlık adı (BTC, ETH, STOCK, GOLD, USD) |
| `asset_type` | `VARCHAR(20)` | `NOT NULL` | Varlık kategorisi (CRYPTO, STOCK, GOLD, FIAT) |
| `quantity` | `NUMERIC(16,6)` | `NOT NULL, DEFAULT 0.000000` | Sahip olunan miktar (6 ondalık hassasiyet) |
| `total_invested` | `NUMERIC(12,2)` | `NOT NULL, DEFAULT 0.00` | Toplam yatırılan TL miktarı |
| `average_cost` | `NUMERIC(12,2)` | `NOT NULL, DEFAULT 0.00` | Ortalama alım maliyeti |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Son güncelleme zamanı |
| — | — | `UNIQUE(user_id, asset_name)` | Aynı kullanıcı aynı varlıktan yalnızca bir kayda sahip olabilir |

### 4.3 Seed (Başlangıç) Verileri

Sistem ilk başlatıldığında, demo amaçlı olarak aşağıdaki veriler otomatik oluşturulur:

**Kullanıcı:**
- Ahmet Yılmaz (`ahmet@finup.com`) — Başlangıç bakiyesi: 2.500,00 TL

**Yatırım Profili:**
- Risk Tipi: `AGGRESSIVE` (Agresif)
- Tetik Limiti: 50,00 TL
- Tam Yuvarlama: 2,00 TL

**Başlangıç Portföyü:**
- 0.000350 BTC (450,00 TL yatırılmış)
- 0.002800 ETH (300,00 TL yatırılmış)

**Başlangıç İşlemleri:**
- 64,30 TL — Starbucks Coffee (5,70 TL küsürat, `PENDING`)
- 128,50 TL — Burger King (1,50 TL küsürat, `PENDING`)

---

## 5. Backend Mimarisi ve Modüller

### 5.1 Dizin Yapısı

```
backend/
├── Dockerfile                    # Docker konteyner tanımı
├── package.json                  # Node.js proje yapılandırması ve bağımlılıklar
└── src/
    ├── app.js                    # Ana giriş noktası (Express sunucu + Bootstrap)
    ├── config/
    │   ├── db.js                 # PostgreSQL bağlantı havuzu ve şema başlatma
    │   └── redis.js              # Redis bağlantı yapılandırması
    ├── db/
    │   └── schema.sql            # Veritabanı şeması ve seed verileri
    ├── queue/
    │   └── queue.js              # Redis kuyruk modülü (RPUSH, BLPOP, log yönetimi)
    ├── routes/
    │   └── api.js                # RESTful API endpoint tanımları
    └── services/
        ├── roundUpService.js     # Küsürat yuvarlama motoru (Round-Up Engine)
        └── investmentService.js  # Yatırım dağıtım motoru (Investment Engine)
```

### 5.2 Uygulama Başlatma Süreci (Bootstrap)

`app.js` dosyasındaki `bootstrap()` fonksiyonu, uygulamanın başlatılma sürecini yönetir. Bu süreç üç kritik adımdan oluşur:

```
Bootstrap Süreci:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. initDatabase()
   ├── PostgreSQL'e bağlan (5 deneme, her denemede 5 sn bekleme)
   ├── 'users' tablosu var mı kontrol et
   ├── Yoksa → schema.sql dosyasını oku ve çalıştır (CREATE TABLE + INSERT)
   └── Varsa → "Tablolar zaten mevcut" logla ve atla

2. startWorker(processRoundUpJob)
   ├── Sonsuz döngüde BLPOP ile kuyruğu dinle
   ├── İş geldiğinde processRoundUpJob() fonksiyonunu çağır
   └── Hata durumunda 5 saniye bekle ve yeniden dene

3. app.listen(5000)
   └── Express HTTP sunucusunu başlat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Önemli Tasarım Kararı:** `startWorker()` fonksiyonu `await` ile beklenmez (`.catch()` ile hata yakalanır). Bu sayede Worker'ın sonsuz `BLPOP` döngüsü Express sunucusunun başlamasını engellemez. Node.js'in event loop'u her iki görevi de paralel olarak yürütür.

### 5.3 Veritabanı Bağlantı Yönetimi

`config/db.js` modülü, PostgreSQL bağlantı havuzunu (`Connection Pool`) yönetir:

- **Connection Pool:** `pg.Pool` sınıfı kullanılarak bir bağlantı havuzu oluşturulur. Bu, her istek için yeni bağlantı açmak yerine mevcut bağlantıları yeniden kullanarak performansı artırır.
- **Otomatik Yeniden Deneme:** `initDatabase()` fonksiyonu, PostgreSQL'in hazır olmasını beklemek için 5 deneme yapabilir. Docker ortamında servislerin sırayla başladığı durumlarda bu kritik öneme sahiptir.
- **Otomatik Şema Oluşturma:** İlk çalıştırmada `users` tablosunun var olup olmadığını kontrol eder. Tablo yoksa `schema.sql` dosyasını okuyarak tüm tabloları ve seed verileri oluşturur.

### 5.4 Redis Bağlantı Yönetimi

`config/redis.js` modülü, `ioredis` kütüphanesi ile Redis bağlantısını yönetir:

- **Üstel Geri Çekilme (Exponential Backoff):** Bağlantı hatalarında yeniden deneme stratejisi uygulanır. Bekleme süresi her denemede artar (maks. 3 saniye).
- **maxRetriesPerRequest: null:** Bu ayar, `BLPOP` gibi uzun süren komutların zaman aşımına uğramamasını sağlar. Worker'ın blokaj modunda sınırsız süre beklememesi için gereklidir.
- **Olay Dinleyicileri:** `connect` ve `error` olayları dinlenerek bağlantı durumu loglanır.

### 5.5 Mesaj Kuyruğu Sistemi (Queue)

`queue/queue.js` modülü, Redis tabanlı mesaj kuyruğu sistemini uygular. Bu modül dört ana fonksiyon içerir:

#### `addTransactionToQueue(jobData)`
- Redis `RPUSH` komutu ile `transaction_queue` listesinin sonuna yeni bir iş ekler.
- İş verisi JSON formatında serileştirilir: `{transactionId, userId, amount, merchant}`
- Her ekleme işlemi loglanır.

#### `addLog(message)`
- İşlem loglarını Redis `finup:processing_logs` listesine ekler.
- Her log mesajına zaman damgası eklenir.
- `LTRIM` ile liste son 100 kayıtla sınırlandırılır (bellek tüketimini önler).
- Hem Redis'e yazılır hem de `console.log` ile terminal çıktısı verilir.

#### `getLatestLogs()`
- Redis `LRANGE` komutu ile tüm logları getirir.
- Frontend'in `/api/logs` endpoint'i üzerinden eriştiği fonksiyondur.

#### `startWorker(processJob)`
- Sonsuz döngüde `BLPOP` komutu ile `transaction_queue` listesini dinler.
- `BLPOP` blokaj modunda çalışır (30 saniye timeout ile). Kuyrukta iş olduğunda anında, yoksa 30 saniye bekleyip tekrar kontrol eder.
- Her `BLPOP` çağrısı için `redis.duplicate()` ile yeni bir istemci oluşturulur. Bu, ana Redis istemcisinin diğer komutları (API istekleri, log yazma vb.) işlemesini engellemez.
- İş alındığında, `processJob` callback fonksiyonu çağrılarak iş işlenir.

**Redis Kuyruk Yapısı:**

```
transaction_queue (Redis List)
┌────────────────────────────────────────────────┐
│ Kuyruğun başı (BLPOP)  ◄───  Kuyruğun sonu (RPUSH) │
│                                                     │
│  Job 1  ←  Job 2  ←  Job 3  ←  [yeni job eklenir]  │
│  (ilk    (sonra   (en son                           │
│   alınır) alınır)  alınır)                           │
└────────────────────────────────────────────────┘
FIFO (First In, First Out) prensibi ile çalışır
```

### 5.6 Küsürat Yuvarlama Motoru (Round-Up Engine)

`services/roundUpService.js` modülündeki `processRoundUpJob()` fonksiyonu, asenkron kuyruğun işçi (worker) fonksiyonudur. Her bir harcama işlemi için aşağıdaki adımları uygular:

**Adım 1 — Profil Bilgisi Çekme:**
```
PostgreSQL → investment_profiles tablosundan risk_type, trigger_limit, exact_round_up değerleri okunur
```

**Adım 2 — Yuvarlama Miktarı Hesaplama:**
```
Harcama Tutarı: amount
Kalan (remainder): amount % 10

Eğer remainder === 0 ise:
    roundUpAmount = exact_round_up (profilden gelen sabit miktar, örn. 2.00 TL)
    Örnek: 60.00 TL harcama → 2.00 TL yuvarlama

Eğer remainder !== 0 ise:
    roundUpAmount = 10 - remainder
    Örnek: 64.30 TL harcama → 10 - 4.30 = 5.70 TL yuvarlama
```

**Adım 3 — Atomik Bakiye Kontrolü ve Güncelleme (PostgreSQL Transaction):**
```sql
BEGIN;
    -- Satır kilidi ile eş zamanlı erişimi engelle
    SELECT bank_balance FROM users WHERE id = $1 FOR UPDATE;
    
    -- Yeterli bakiye var mı?
    IF bank_balance < roundUpAmount THEN
        -- Yetersiz bakiye: FAILED_INSUFFICIENT olarak kaydet
        INSERT INTO round_up_pool (..., status = 'FAILED_INSUFFICIENT');
    ELSE
        -- Yeterli bakiye: Bakiyeden düş ve PENDING olarak kaydet
        UPDATE users SET bank_balance = bank_balance - roundUpAmount;
        INSERT INTO round_up_pool (..., status = 'PENDING');
    END IF;
COMMIT;
```

**Adım 4 — Redis Havuz Bakiyesi Güncelleme:**
```
Redis INCRBYFLOAT pool:user:{userId} {roundUpAmount}
→ Havuz bakiyesi atomik olarak artırılır
```

**Adım 5 — Tetik Limiti Kontrolü:**
```
Eğer newRedisPoolBalance >= triggerLimit:
    → allocateFunds() fonksiyonu çağrılır (Investment Engine)
    → Başarılı ise Redis pool bakiyesi 0'a sıfırlanır
Aksi halde:
    → "Yatırım limitine kalan: X TL" loglanır
```

### 5.7 Yatırım Dağıtım Motoru (Investment Engine)

`services/investmentService.js` modülündeki `allocateFunds()` fonksiyonu, havuz limiti aşıldığında tetiklenen otomatik yatırım dağıtım mekanizmasıdır.

**Simüle Edilen Varlık Fiyatları (Mock Prices):**

| Varlık | Birim Fiyat (TL) | Varlık Kategorisi |
|--------|-------------------|-------------------|
| BTC (Bitcoin) | 3.100.000,00 | CRYPTO |
| ETH (Ethereum) | 120.000,00 | CRYPTO |
| STOCK (Teknoloji Hisse) | 500,00 | STOCK |
| GOLD (Gram Altın) | 2.500,00 | GOLD |
| USD (Amerikan Doları) | 32,00 | FIAT |

**Risk Profili Dağıtım Kuralları:**

| Risk Profili | Varlık 1 | Varlık 2 | Varlık 3 |
|-------------|----------|----------|----------|
| 🛡️ **Muhafazakar (CONSERVATIVE)** | %80 GOLD (Altın) | %20 USD (Döviz) | — |
| ⚖️ **Dengeli (MODERATE)** | %40 STOCK (Hisse) | %30 GOLD (Altın) | %30 USD (Döviz) |
| 🔥 **Agresif (AGGRESSIVE)** | %40 BTC (Bitcoin) | %20 ETH (Ethereum) | %40 STOCK (Hisse) |

**Dağıtım Algoritması (Pseudocode):**

```
fonksiyon allocateFunds(userId, amountToInvest, riskType):
    
    allocationRules = ALLOCATIONS[riskType]
    
    PostgreSQL Transaction BAŞLA:
        
        HER kural İÇİN (asset, percentage):
            investedTL = amountToInvest × percentage
            purchasedQty = investedTL / ASSET_PRICES[asset]
            
            EĞER kullanıcının portföyünde bu varlık VARSA:
                newQty = mevcutMiktar + purchasedQty
                newTotalInvested = mevcutToplam + investedTL
                newAvgCost = newTotalInvested / newQty
                UPDATE user_portfolio
            DEĞİLSE:
                INSERT INTO user_portfolio (yeni varlık kaydı)
            
        round_up_pool tablosunda tüm 'PENDING' kayıtları → 'INVESTED' olarak güncelle
        
    Transaction COMMIT
```

---

## 6. API Endpoint Dokümantasyonu

Tüm API endpoint'leri `/api` ön eki altında tanımlanmıştır. Backend `http://localhost:5000` adresinde çalışır.

### GET `/api/user/:id` — Kullanıcı Bilgileri ve Havuz Bakiyesi

Kullanıcının temel bilgilerini, yatırım profilini ve Redis'teki havuz bakiyesini döner.

**Parametre:** `id` — Kullanıcı ID (integer)

**Başarılı Yanıt (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "email": "ahmet@finup.com",
    "bank_balance": "2494.30"
  },
  "profile": {
    "risk_type": "AGGRESSIVE",
    "trigger_limit": "50.00",
    "exact_round_up": "2.00"
  },
  "poolBalance": 5.70
}
```

**Veri Kaynakları:**
- `user` → PostgreSQL `users` tablosu
- `profile` → PostgreSQL `investment_profiles` tablosu
- `poolBalance` → Redis `pool:user:{id}` anahtarı

---

### POST `/api/user/:id/profile` — Yatırım Profili Güncelleme

Kullanıcının risk profilini, tetik limitini ve tam yuvarlama miktarını günceller.

**Parametre:** `id` — Kullanıcı ID (integer)

**İstek Gövdesi (Request Body):**
```json
{
  "risk_type": "MODERATE",
  "trigger_limit": 100.00,
  "exact_round_up": 5.00
}
```

**Başarılı Yanıt (200):**
```json
{
  "message": "Ayarlar başarıyla güncellendi."
}
```

**Teknik Detay:** `INSERT ... ON CONFLICT (user_id) DO UPDATE` sorgusu ile upsert (varsa güncelle, yoksa oluştur) deseni uygulanır.

---

### POST `/api/spend` — Harcama Simülasyonu (Asenkron Akış Başlatır)

Sanal kart harcaması simüle eder. Harcamayı veritabanına kaydeder ve yuvarlama işlemini kuyruğa ekler.

**İstek Gövdesi (Request Body):**
```json
{
  "user_id": 1,
  "amount": 64.30,
  "merchant": "Starbucks Coffee"
}
```

**Başarılı Yanıt (202 Accepted):**
```json
{
  "message": "Harcama kaydedildi, yuvarlama işlemi arka planda kuyruğa alındı.",
  "transactionId": 3
}
```

**Neden HTTP 202?** İşlem henüz tamamlanmamıştır. Yuvarlama ve olası yatırım işlemleri arka planda asenkron olarak gerçekleşecektir. Bu, REST API tasarımında **asenkron işlem kabul** semantiğini temsil eder.

**İşlem Sırası:**
1. Kullanıcı varlığı kontrol edilir
2. Harcama tutarı doğrulanır (> 0)
3. `transactions` tablosuna INSERT yapılır
4. İş verisi Redis kuyruğuna RPUSH ile eklenir
5. HTTP 202 döner (istemci bloklanmaz)

---

### GET `/api/user/:id/portfolio` — Kullanıcı Portföyü

Kullanıcının yatırım portföyündeki tüm varlıkları, toplam yatırılan miktar sırasına göre döner.

**Başarılı Yanıt (200):**
```json
[
  {
    "id": 1,
    "asset_name": "BTC",
    "asset_type": "CRYPTO",
    "quantity": "0.000350",
    "total_invested": "450.00",
    "average_cost": "1285714.28",
    "updated_at": "2026-06-05T00:00:00.000Z"
  },
  {
    "id": 2,
    "asset_name": "ETH",
    "asset_type": "CRYPTO",
    "quantity": "0.002800",
    "total_invested": "300.00",
    "average_cost": "107142.85",
    "updated_at": "2026-06-05T00:00:00.000Z"
  }
]
```

---

### GET `/api/user/:id/transactions` — İşlem Geçmişi

Kullanıcının son 15 harcama işlemini, yuvarlama bilgileri ile birlikte döner.

**Başarılı Yanıt (200):**
```json
[
  {
    "id": 2,
    "amount": "128.50",
    "merchant": "Burger King",
    "created_at": "2026-06-05T00:00:00.000Z",
    "round_up_amount": "1.50",
    "round_up_status": "PENDING"
  }
]
```

**Teknik Detay:** `transactions` ve `round_up_pool` tabloları `LEFT JOIN` ile birleştirilir. `LEFT JOIN` kullanılmasının sebebi, henüz Worker tarafından işlenmemiş işlemlerin de listelenebilmesidir.

---

### GET `/api/logs` — Gerçek Zamanlı İşlem Logları

Redis'teki `finup:processing_logs` listesinden son logları döner. Frontend terminal paneli bu endpoint'i polling ile sorgular.

**Başarılı Yanıt (200):**
```json
{
  "logs": [
    "[14:32:15] [System] Yuvarlama Worker (Round-Up Worker) aktif, kuyruk dinleniyor...",
    "[14:32:20] [Queue] Harcama kuyruğa eklendi. Tx ID: 3, Miktar: 64.30 TL (Starbucks Coffee)",
    "[14:32:20] [Engine] Başlıyor... Tx ID: 3, Kullanıcı ID: 1, Harcama: 64.30 TL (Starbucks Coffee)",
    "[14:32:20] [Round-Up Engine] Harcama: 64.30 TL. En yakın 10'luğa yuvarlama farkı: 5.70 TL",
    "[14:32:20] [Engine DB] Kullanıcı bakiyesinden 5.70 TL düşüldü. Yeni bakiye: 2494.30 TL.",
    "[14:32:20] [Redis Cache] Havuz bakiyesi güncellendi (Redis). Yeni biriken: 5.70 TL / Limit: 50.00 TL",
    "[14:32:20] [Engine] İşlem tamamlandı. Yatırım limitine kalan: 44.30 TL."
  ]
}
```

---

### POST `/api/reset` — Sistem Sıfırlama

Tüm veritabanını ve Redis önbelleğini başlangıç durumuna sıfırlar. Demo tekrarları için kullanılır.

**Başarılı Yanıt (200):**
```json
{
  "message": "Sistem başarıyla sıfırlandı!"
}
```

**İşlem Sırası:**
1. `schema.sql` dosyası okunur (DROP TABLE IF EXISTS + CREATE TABLE + INSERT seed data)
2. Redis `pool:user:1` anahtarı `0`'a sıfırlanır
3. Redis `finup:processing_logs` listesi silinir
4. Yeni sistem başlatma logu eklenir

---

### GET `/health` — Sağlık Kontrolü

Sistemin çalışır durumda olup olmadığını kontrol eder. Docker sağlık kontrolü ve izleme araçları için kullanılır.

**Başarılı Yanıt (200):**
```json
{
  "status": "ok",
  "time": "2026-06-05T00:00:00.000Z"
}
```

> **Not:** Bu endpoint `/api` ön eki altında değildir, doğrudan kök dizinde (`/health`) tanımlıdır.

---

## 7. Frontend Mimarisi ve Bileşenler

### 7.1 Dizin Yapısı

```
frontend/
├── Dockerfile                    # Docker konteyner tanımı
├── package.json                  # Node.js proje yapılandırması ve bağımlılıklar
├── vite.config.js                # Vite yapılandırması (port, host, polling)
├── index.html                    # HTML giriş noktası (Google Fonts, meta bilgileri)
└── src/
    ├── main.jsx                  # React uygulamasının DOM'a bağlanma noktası
    ├── App.jsx                   # Ana uygulama bileşeni (tüm UI mantığı)
    └── index.css                 # Global stil tanımları (Glassmorphism tasarım sistemi)
```

### 7.2 Bileşen Mimarisi

Uygulama tek sayfalık (SPA) bir dashboard olarak tasarlanmıştır. Tüm UI mantığı `App.jsx` dosyasında merkezi olarak yönetilir. Bileşen hiyerarşisi:

```
AppWithBoundary (ErrorBoundary)
└── App
    ├── Header Section
    │   ├── Logo Container (⚡ FinUp branding)
    │   └── User Status + Sıfırla Butonu
    │
    ├── Stats Dashboard Cards (4 adet)
    │   ├── Card 1: Simüle Banka Kartı Bakiyesi
    │   ├── Card 2: Yatırım Havuzunda Biriken (Progress bar)
    │   ├── Card 3: Toplam Yatırım Portföyü
    │   └── Card 4: Aktif Risk Profili
    │
    ├── Operational Grid (2 sütun)
    │   ├── Sol Sütun
    │   │   ├── Sanal Kart Harcama Simülatörü (form)
    │   │   └── Otomatik Yatırım ve Profil Ayarları (form)
    │   │
    │   └── Sağ Sütun
    │       └── Yuvarlama Servisi Asenkron Log Paneli (terminal)
    │
    ├── Portfolio Grid (2 sütun)
    │   ├── Sol (7/12): Yatırım Varlıkları Portföyü + Doughnut Grafik
    │   └── Sağ (5/12): Son Harcamalar & Yuvarlama Durumları
    │
    └── Footer (Teknoloji kredileri)
```

### 7.3 State Yönetimi

Uygulama, React'in yerleşik `useState` hook'u ile state yönetimi yapar. Harici state yönetim kütüphanesi (Redux, Zustand vb.) kullanılmamıştır çünkü tüm state tek bileşen içinde yönetilmektedir.

**Tanımlanan State Değişkenleri:**

| State | Tip | Açıklama |
|-------|-----|----------|
| `loading` | `boolean` | İlk veri yüklemesi sırasında spinner gösterimi |
| `error` | `string \| null` | API bağlantı hata mesajı |
| `userStats` | `object` | Kullanıcı bilgileri, profil ve havuz bakiyesi |
| `portfolio` | `array` | Portföy varlıkları listesi |
| `transactions` | `array` | İşlem geçmişi listesi |
| `logs` | `array` | Asenkron işlem logları |
| `spendAmount` | `string` | Harcama simülatörü tutar girişi |
| `spendMerchant` | `string` | Harcama simülatörü işyeri girişi |
| `spendLoading` | `boolean` | Harcama isteği gönderim durumu |
| `spendMessage` | `string` | Harcama sonuç mesajı (başarı/hata) |
| `riskType` | `string` | Seçilen risk profili |
| `triggerLimit` | `string` | Yatırım tetik limiti girişi |
| `exactRoundUp` | `string` | Tam yuvarlama miktarı girişi |
| `settingsLoading` | `boolean` | Ayar güncelleme isteği durumu |
| `settingsMessage` | `string` | Ayar güncelleme sonuç mesajı |
| `resetLoading` | `boolean` | Sistem sıfırlama isteği durumu |

### 7.4 Gerçek Zamanlı Güncelleme Mekanizması

Frontend, backend'deki asenkron değişiklikleri yakalamak için **HTTP Polling** (yoklama) mekanizması kullanır:

```
useEffect(() => {
    fetchDashboardData();        // İlk yükleme (loading spinner gösterilir)
    
    const pollInterval = setInterval(() => {
        pollRealTimeUpdates();   // Her 1.5 saniyede sessiz güncelleme
    }, 1500);

    return () => clearInterval(pollInterval);  // Temizleme (cleanup)
}, []);
```

**`fetchDashboardData()` vs `pollRealTimeUpdates()` Farkı:**

| Özellik | fetchDashboardData | pollRealTimeUpdates |
|---------|-------------------|---------------------|
| Kullanım | İlk yükleme, sıfırlama sonrası | Arka plan güncellemesi |
| Loading Spinner | Gösterilir | Gösterilmez |
| Hata Yönetimi | Ekranda hata mesajı gösterilir | Sessizce loglanır (`console.warn`) |
| Sorgulanan Endpoint'ler | 4 adet (user, portfolio, transactions, logs) | 4 adet (user, portfolio, transactions, logs) |

**Neden WebSocket Yerine Polling?**
Proje kapsamında WebSocket yerine polling tercih edilmiştir çünkü:
1. WebSocket, ek altyapı ve durum yönetimi gerektirir
2. 1.5 saniyelik polling aralığı, bu simülasyon için yeterli gerçek zamanlılık sağlar
3. Uygulama karmaşıklığını düşük tutar

### 7.5 UI/UX Tasarım Kararları

**Tasarım Dili: Glassmorphism + Cyberpunk**

Arayüz, modern Fintech uygulamalarından ilham alan bir tasarım diline sahiptir:

| Tasarım Öğesi | Uygulama |
|---------------|----------|
| **Glassmorphism** | Yarı saydam paneller (`backdrop-filter: blur(16px)`) ile derinlik hissi |
| **Neon Glow** | Aktif öğelerde neon parlama efektleri (`box-shadow` ile) |
| **Dark Theme** | Koyu arka plan (`#08090d`) ile göz yorgunluğunu azaltan tema |
| **Gradient Text** | Logo ve başlıklarda CSS gradient text efekti |
| **Terminal Paneli** | Monospace font (`JetBrains Mono`) ile gerçekçi terminal görünümü |
| **Mikro Animasyonlar** | Log satırlarında kayma animasyonu, butonlarda hover efekti |
| **Progress Bar** | Havuz birikiminin limitle oranını gösteren animasyonlu ilerleme çubuğu |
| **Doughnut Chart** | Portföy dağılımını gösteren halka grafik (merkezdeki toplam değer ile) |

**Tipografi:**
- Ana font: **Outfit** (Google Fonts) — Modern, temiz geometrik sans-serif
- Kod/Terminal fontu: **JetBrains Mono** — Geliştirici dostu monospace font

**Renk Paleti:**

| Renk | Hex | Kullanım |
|------|-----|----------|
| Cyber Teal | `#00f2fe` | Ana marka rengi, havuz bakiyesi, neon efektler |
| Electric Blue | `#4facfe` | Banka bakiyesi, ikincil vurgu |
| Neon Pink | `#d946ef` | Portföy değeri, ETH varlık rengi |
| Emerald | `#10b981` | Başarı mesajları, INVESTED badge |
| Amber | `#f59e0b` | Uyarılar, PENDING badge, MODERATE profil |
| Rose | `#ef4444` | Hata mesajları, FAILED badge, AGGRESSIVE profil |

**ErrorBoundary Bileşeni:**
React uygulamasının çökme durumlarını zarif bir şekilde yönetir. Beklenmeyen bir runtime hatası oluştuğunda, tüm ekranın beyaz kalması yerine kullanıcıya hata mesajı ve "Sayfayı Yenile" butonu gösterilir.

---

## 8. Docker ve Konteynerizasyon

### 8.1 Docker Compose Servisleri

Proje, Docker Compose ile orchestrate edilen 4 servisten oluşur:

| Servis | İmaj | Konteyner Adı | Port Eşlemesi | Rol |
|--------|------|---------------|---------------|-----|
| `db` | `postgres:15-alpine` | `finup-postgres` | `5432:5432` | İlişkisel veritabanı |
| `redis` | `redis:7-alpine` | `finup-redis` | `6379:6379` | Mesaj kuyruğu + Önbellek |
| `backend` | Custom (Node.js 20) | `finup-backend` | `5000:5000` | REST API + Worker |
| `frontend` | Custom (Node.js 20) | `finup-frontend` | `3000:3000` | React SPA (Vite dev server) |

**Dockerfile Detayları (Backend & Frontend):**

Her iki servis için de aynı Dockerfile yapısı kullanılır:

```dockerfile
FROM node:20-alpine        # Minimal Alpine tabanlı Node.js 20 imajı
WORKDIR /app               # Çalışma dizini
COPY package*.json ./      # Önce bağımlılık dosyalarını kopyala (Docker cache optimizasyonu)
RUN npm install            # Bağımlılıkları kur
COPY . .                   # Kaynak kodları kopyala
EXPOSE {port}              # Port tanımı
CMD [...]                  # Başlatma komutu
```

**Docker Cache Optimizasyonu:** `package.json` dosyası kaynak koddan önce kopyalanır. Bu sayede kaynak kod değişikliklerinde `npm install` adımı Docker cache'inden çekilir ve rebuild süresi önemli ölçüde kısalır.

### 8.2 Servis Bağımlılık Grafiği

```
                    ┌──────────────┐
                    │   frontend   │
                    │  (Port 3000) │
                    └──────┬───────┘
                           │
                    depends_on
                           │
                    ┌──────▼───────┐
                    │   backend    │
                    │  (Port 5000) │
                    └──┬───────┬───┘
                       │       │
              depends_on     depends_on
                       │       │
              ┌────────▼──┐  ┌─▼────────────┐
              │    db      │  │    redis      │
              │ (Port 5432)│  │ (Port 6379)  │
              └────────────┘  └──────────────┘
```

Bu bağımlılık grafiği, Docker Compose'un servisleri doğru sırada başlatmasını sağlar:
1. Önce `db` (PostgreSQL) ve `redis` başlar
2. Sonra `backend` başlar (veritabanı ve Redis'e bağlanır)
3. Son olarak `frontend` başlar (backend'e API istekleri yapar)

### 8.3 Volume Yönetimi

```yaml
volumes:
  postgres_data:   # PostgreSQL verilerinin kalıcı olarak saklanması
  redis_data:      # Redis verilerinin diske yazılması (AOF/RDB persistence)
```

Docker named volume'ları, konteynerler silinip yeniden oluşturulduğunda verilerin kaybolmamasını sağlar. `docker compose down -v` komutu ile volume'lar açıkça silinmediği sürece veriler korunur.

**Ortam Değişkenleri (Environment Variables):**

| Servis | Değişken | Değer | Açıklama |
|--------|----------|-------|----------|
| db | `POSTGRES_USER` | `finup_user` | PostgreSQL kullanıcı adı |
| db | `POSTGRES_PASSWORD` | `finup_password` | PostgreSQL şifresi |
| db | `POSTGRES_DB` | `finup_db` | Veritabanı adı |
| backend | `PORT` | `5000` | Express sunucu portu |
| backend | `DATABASE_URL` | `postgresql://finup_user:finup_password@db:5432/finup_db` | PostgreSQL bağlantı dizesi |
| backend | `REDIS_URL` | `redis://redis:6379` | Redis bağlantı dizesi |
| backend | `NODE_ENV` | `development` | Ortam modu |
| frontend | `VITE_API_URL` | `http://localhost:5000/api` | Backend API adresi |

> **Not:** Docker Compose ağ yapısında servisler birbirine servis adı ile erişir (örn. `db`, `redis`). Bu nedenle `DATABASE_URL`'de `localhost` yerine `db` kullanılır.

---

## 9. Kurulum ve Çalıştırma

### 9.1 Ön Gereksinimler

| Gereksinim | Minimum Versiyon | İndirme Linki |
|------------|-------------------|---------------|
| Docker Desktop | 4.x | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Git | 2.x | [git-scm.com](https://git-scm.com/) |

> **Önemli:** Node.js, PostgreSQL, Redis gibi araçların ayrıca kurulmasına **gerek yoktur**. Tüm bağımlılıklar Docker konteynerlerinde çalışır.

### 9.2 Kurulum Adımları

```bash
# 1. Repoyu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/FinUp.git

# 2. Proje dizinine girin
cd FinUp

# 3. Tek komutla tüm sistemi başlatın
docker compose up --build -d
```

**Komut Açıklamaları:**
- `--build`: Her çalıştırmada imajları yeniden oluşturur (kaynak kod değişiklikleri için)
- `-d`: Detached mod — konteynerler arka planda çalışır

İlk çalıştırmada Docker aşağıdaki işlemleri otomatik yapar:
1. PostgreSQL 15 ve Redis 7 imajlarını Docker Hub'dan indirir
2. Backend ve Frontend için Dockerfile'ları build eder
3. `npm install` ile tüm bağımlılıkları kurar
4. Servisleri bağımlılık sırasına göre başlatır
5. PostgreSQL'de tabloları oluşturur ve seed verilerini ekler
6. Redis Worker'ını başlatır

Bu süreç ilk seferde 2-5 dakika sürebilir (internet hızına bağlı). Sonraki çalıştırmalarda Docker cache sayesinde çok daha hızlıdır.

### 9.3 Erişim Adresleri

| Servis | URL | Açıklama |
|--------|-----|----------|
| 🎨 Dashboard (Arayüz) | [http://localhost:3000](http://localhost:3000) | React uygulaması — ana kullanıcı arayüzü |
| 🔌 Backend API | [http://localhost:5000/health](http://localhost:5000/health) | Sağlık kontrolü endpoint'i |
| 🔌 Backend API Base | [http://localhost:5000/api](http://localhost:5000/api) | API kök dizini |

---

## 10. Kullanım Kılavuzu

Sistem başlatıldıktan sonra tarayıcınızdan `http://localhost:3000` adresine erişerek dashboard'u açın.

### Adım 1 — Harcama Simüle Etme

1. Dashboard'ın sol üst kısmındaki **"Sanal Kart Harcama Simülatörü"** panelini bulun
2. **İşyeri (Merchant)** alanına bir işyeri adı girin (örn. "Starbucks Coffee")
3. **Harcama Tutarı (TL)** alanına bir tutar girin (örn. "64.30")
4. Panel altında otomatik olarak hesaplanan **"Yuvarlanacak: 5.70 TL"** bilgisini görün
5. **"Simüle Harcama Yap"** butonuna tıklayın
6. "✅ Harcama yapıldı! Yuvarlama motoru devreye girdi." mesajını bekleyin

### Adım 2 — Asenkron Logları İzleme

1. Sağ taraftaki **"Yuvarlama Servisi Asenkron Log Paneli"** terminal ekranını izleyin
2. Her harcama sonrasında aşağıdaki log akışını gerçek zamanlı olarak göreceksiniz:
   - `[Queue]` — İşlem kuyruğa eklendi
   - `[Engine]` — Worker işlemi aldı
   - `[Round-Up Engine]` — Yuvarlama hesaplandı
   - `[Engine DB]` — Bakiyeden düşüldü
   - `[Redis Cache]` — Havuz güncellendi
   - `[Engine]` — İşlem tamamlandı

### Adım 3 — Yatırım Ayarlarını Değiştirme

1. Sol alttaki **"Otomatik Yatırım ve Profil Ayarları"** panelini bulun
2. **Risk Profili** seçeneğinden bir profil seçin:
   - 🛡️ Muhafazakar (%80 Altın, %20 Döviz)
   - ⚖️ Dengeli (%40 Hisse, %30 Altın, %30 Döviz)
   - 🔥 Agresif (%40 BTC, %20 ETH, %40 Hisse)
3. **Yatırım Tetik Limiti** ve **Tam Yuvarlama** miktarını ayarlayın
4. **"Ayarları Kaydet"** butonuna tıklayın

### Adım 4 — Portföy ve Yatırım Takibi

1. Havuz birikimi tetik limitini aştığında **otomatik yatırım** gerçekleşir
2. Alt kısımdaki **"Yatırım Varlıkları Portföyü"** panelinde:
   - Doughnut grafik ile portföy dağılımını görün
   - Her varlığın miktar ve toplam yatırım değerini inceleyin
3. **"Son Harcamalar & Yuvarlama Durumları"** panelinde:
   - Her işlemin yuvarlama miktarını ve durumunu (Beklemede / Yatırıldı / İptal) görün

### Adım 5 — Sistem Sıfırlama

1. Sağ üst köşedeki **"Sıfırla"** butonuna tıklayın
2. Onay dialogunda "Tamam" deyin
3. Sistem başlangıç seed verilerine sıfırlanır

---

## 11. Test Senaryoları

Aşağıdaki senaryolar sistemin doğru çalıştığını doğrulamak için kullanılabilir:

### Senaryo 1: Standart Küsürat Yuvarlama

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | 64.30 TL harcama simüle et | İşlem kaydedilir |
| 2 | Worker logu kontrol et | "Harcama: 64.30 TL. En yakın 10'luğa yuvarlama farkı: 5.70 TL" |
| 3 | Banka bakiyesini kontrol et | Önceki bakiye - 5.70 TL |
| 4 | Havuz bakiyesini kontrol et | +5.70 TL artmış olmalı |
| 5 | İşlem durumunu kontrol et | `PENDING` |

### Senaryo 2: Tam 10'luk Harcama

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | 60.00 TL harcama simüle et | İşlem kaydedilir |
| 2 | Worker logu kontrol et | "Tam 10'luk harcama algılandı. Sabit yuvarlama uygulandı: 2.00 TL" |
| 3 | Havuz bakiyesini kontrol et | +2.00 TL artmış olmalı (exact_round_up değeri) |

### Senaryo 3: Yetersiz Bakiye Kontrolü

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Banka bakiyesini düşür (tekrarlayan harcamalarla) | Bakiye düşük seviyeye gelir |
| 2 | Yuvarlama miktarından düşük bakiye ile harcama yap | Yuvarlama iptal edilir |
| 3 | Worker logu kontrol et | "Yetersiz Bakiye! ... Küsürat yuvarlama işlemi iptal edildi." |
| 4 | İşlem durumunu kontrol et | `FAILED_INSUFFICIENT` |
| 5 | Banka bakiyesini kontrol et | Değişmemiş olmalı (düşülmedi) |

### Senaryo 4: Limit Aşımı ve Otomatik Yatırım

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Tekrarlanan harcamalar ile havuzu 50 TL'nin üzerine çıkar | Havuz dolmaya devam eder |
| 2 | Limit aşıldığında Worker logunu kontrol et | "[Trigger] Yatırım Limiti (50.00 TL) AŞILDI!" |
| 3 | Dağıtım loglarını kontrol et | Risk profiline göre her varlığa dağıtım logları |
| 4 | Portföyü kontrol et | Yeni varlık miktarları eklenmış olmalı |
| 5 | Havuz bakiyesini kontrol et | 0.00 TL'ye sıfırlanmış olmalı |
| 6 | İşlem durumlarını kontrol et | Tüm PENDING kayıtlar → `INVESTED` |

### Senaryo 5: Ayar Değiştirme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Risk profilini "Muhafazakar" olarak değiştir | Ayarlar kaydedilir |
| 2 | Limit aşımını tetikle | Dağıtım Muhafazakar kurallara göre yapılır |
| 3 | Portföyü kontrol et | %80 GOLD, %20 USD dağıtımı görülmeli |

---

## 12. Risk Profili ve Yatırım Dağıtım Algoritması

Sistem üç farklı risk profilini destekler. Her profil, farklı varlık sınıflarına farklı oranlarda dağıtım yapar:

### 🛡️ Muhafazakar Profil (CONSERVATIVE)

Düşük riskli, istikrarlı getirileri hedefleyen profil. Sermaye korunması ön plandadır.

```
Toplam Dağıtım: 100%
├── %80 → GOLD (Gram Altın)    → Güvenli liman, enflasyona karşı koruma
└── %20 → USD (Amerikan Doları) → Döviz çeşitlendirmesi, TL risk hedging
```

### ⚖️ Dengeli Profil (MODERATE)

Orta düzey risk alan, büyüme ve istikrar arasında denge kuran profil.

```
Toplam Dağıtım: 100%
├── %40 → STOCK (Teknoloji Hisse) → Uzun vadeli büyüme potansiyeli
├── %30 → GOLD (Gram Altın)       → Portföy dengeleme, güvenli liman
└── %30 → USD (Amerikan Doları)    → Likidite ve döviz çeşitlendirmesi
```

### 🔥 Agresif Profil (AGGRESSIVE)

Yüksek risk alarak yüksek getiri hedefleyen profil. Volatil varlıklara ağırlık verir.

```
Toplam Dağıtım: 100%
├── %40 → BTC (Bitcoin)           → Yüksek büyüme potansiyeli, kripto lider
├── %20 → ETH (Ethereum)          → DeFi ekosistemi, akıllı kontratlar
└── %40 → STOCK (Teknoloji Hisse) → Teknoloji sektörü büyümesi
```

### Ortalama Maliyet Hesaplama (Dollar-Cost Averaging)

Her yatırım dağıtımında, mevcut portföy verilerine göre ortalama maliyet yeniden hesaplanır:

```
Yeni Miktar = Mevcut Miktar + Satın Alınan Miktar
Yeni Toplam Yatırım = Mevcut Toplam + Yeni Yatırılan TL
Yeni Ortalama Maliyet = Yeni Toplam Yatırım / Yeni Miktar
```

Bu yaklaşım, finans literatüründe **Dollar-Cost Averaging (DCA)** olarak bilinen stratejiyi uygular. Farklı fiyat seviyelerinde düzenli alım yaparak ortalama maliyeti dengeleme amacı taşır.

---

## 13. Güvenlik ve Veri Bütünlüğü

Proje bir simülasyon olmasına rağmen, aşağıdaki güvenlik ve veri bütünlüğü önlemleri uygulanmıştır:

### Veritabanı Seviyesi

| Önlem | Uygulama |
|-------|----------|
| **Atomik Transaction'lar** | Bakiye kontrolü ve güncelleme işlemleri `BEGIN / COMMIT / ROLLBACK` bloğu içinde yapılır |
| **Satır Kilitleme** | `SELECT ... FOR UPDATE` ile eş zamanlı erişimde race condition önlenir |
| **Referans Bütünlüğü** | `FOREIGN KEY` kısıtları ile tabloları arası ilişki bütünlüğü sağlanır |
| **Cascading Delete** | `ON DELETE CASCADE` ile kullanıcı silindiğinde ilişkili tüm veriler otomatik temizlenir |
| **CHECK Kısıtları** | `risk_type` ve `status` alanlarında yalnızca izin verilen değerler kabul edilir |
| **UNIQUE Kısıtları** | Aynı kullanıcı-varlık çifti için tek portföy kaydı, aynı e-posta için tek kullanıcı |

### Uygulama Seviyesi

| Önlem | Uygulama |
|-------|----------|
| **Input Doğrulama** | Harcama tutarının 0'dan büyük olması, zorunlu alanların kontrolü |
| **Parametreli Sorgular** | SQL injection'a karşı `$1, $2, ...` parametreli sorgular kullanılır |
| **Hata İzolasyonu** | Worker hataları HTTP API'yi etkilemez, her bileşen bağımsız çalışır |
| **Floating Point Koruma** | `toFixed(2)` ve `toFixed(6)` ile ondalık hassasiyet kontrol altında tutulur |
| **CORS Yapılandırması** | Frontend-Backend arası güvenli iletişim |
| **ErrorBoundary** | Frontend crash'lerinde kullanıcı dostu hata ekranı |

### Redis Seviyesi

| Önlem | Uygulama |
|-------|----------|
| **Atomik Artış** | `INCRBYFLOAT` ile havuz bakiyesi atomik olarak güncellenir (race condition yok) |
| **Log Sınırlama** | `LTRIM` ile log listesi son 100 kayıtla sınırlandırılır (bellek koruması) |
| **Yeniden Bağlanma** | Otomatik retry stratejisi ile bağlantı kopukluklarında yeniden bağlanma |
| **Ayrı İstemci** | `BLPOP` için ayrı istemci (`redis.duplicate()`) kullanılarak ana istemci bloklanmaz |

---

## 14. Yönetim Komutları

### Servisleri Başlatma

```bash
# Tüm servisleri oluştur ve başlat
docker compose up --build -d

# Sadece belirli bir servisi yeniden başlat
docker compose restart backend
docker compose restart frontend
```

### Servisleri Durdurma

```bash
# Servisleri durdur (veriler korunur)
docker compose down

# Servisleri durdur ve tüm verileri temizle (volumes dahil)
docker compose down -v
```

### Log İzleme

```bash
# Backend loglarını canlı izle
docker logs finup-backend -f

# Frontend loglarını canlı izle
docker logs finup-frontend -f

# PostgreSQL loglarını izle
docker logs finup-postgres -f

# Redis loglarını izle
docker logs finup-redis -f

# Tüm servislerin loglarını birlikte izle
docker compose logs -f
```

### Konteyner Durumu

```bash
# Çalışan konteynerları listele
docker compose ps

# Konteyner kaynak kullanımını izle
docker stats
```

### Veritabanına Doğrudan Erişim

```bash
# PostgreSQL konsoluna bağlan
docker exec -it finup-postgres psql -U finup_user -d finup_db

# Örnek sorgular:
SELECT * FROM users;
SELECT * FROM transactions ORDER BY created_at DESC;
SELECT * FROM round_up_pool WHERE status = 'PENDING';
SELECT * FROM user_portfolio;
```

### Redis'e Doğrudan Erişim

```bash
# Redis CLI'ya bağlan
docker exec -it finup-redis redis-cli

# Örnek komutlar:
GET pool:user:1
LRANGE finup:processing_logs 0 -1
LLEN transaction_queue
```

---

## 15. Proje Dizin Yapısı

```
FinUp/
│
├── README.md                          # Bu dosya — Proje dokümantasyonu
├── docker-compose.yml                 # Docker Compose servisleri tanımı
├── .gitignore                         # Git tarafından göz ardı edilecek dosyalar
├── index.html                         # Kök dizindeki HTML (frontend ile aynı)
│
├── backend/                           # ═══ BACKEND (Node.js + Express) ═══
│   ├── Dockerfile                     # Backend Docker imaj tanımı
│   ├── package.json                   # Backend bağımlılıkları
│   └── src/
│       ├── app.js                     # Ana giriş noktası (Bootstrap)
│       ├── config/
│       │   ├── db.js                  # PostgreSQL bağlantı havuzu
│       │   └── redis.js              # Redis bağlantı yapılandırması
│       ├── db/
│       │   └── schema.sql            # Veritabanı şeması + Seed verileri
│       ├── queue/
│       │   └── queue.js              # Redis kuyruk modülü (RPUSH/BLPOP/Log)
│       ├── routes/
│       │   └── api.js                # RESTful API endpoint'leri (7 endpoint)
│       └── services/
│           ├── roundUpService.js     # Küsürat Yuvarlama Motoru
│           └── investmentService.js  # Yatırım Dağıtım Motoru
│
└── frontend/                          # ═══ FRONTEND (React + Vite) ═══
    ├── Dockerfile                     # Frontend Docker imaj tanımı
    ├── package.json                   # Frontend bağımlılıkları
    ├── vite.config.js                 # Vite yapılandırması
    ├── index.html                     # HTML giriş noktası
    └── src/
        ├── main.jsx                  # React DOM bağlama noktası
        ├── App.jsx                   # Ana uygulama bileşeni (719 satır)
        └── index.css                 # Global stiller (450 satır)
```

---

## 16. Gelecek Geliştirmeler ve Katkıda Bulunma

### Olası Gelecek Geliştirmeler

| Alan | Geliştirme | Açıklama |
|------|-----------|----------|
| **Kimlik Doğrulama** | JWT tabanlı auth sistemi | Kullanıcı kayıt, giriş, oturum yönetimi |
| **Çoklu Kullanıcı** | Multi-tenancy desteği | Birden fazla kullanıcının bağımsız hesaplarla çalışması |
| **Gerçek Zamanlı** | WebSocket entegrasyonu | Polling yerine WebSocket ile anlık güncelleme |
| **Bildirimler** | Push notification sistemi | Yatırım tetiklendiğinde kullanıcıya bildirim |
| **Raporlama** | Detaylı analiz dashboard'u | Aylık/yıllık yatırım raporları, grafikleri |
| **API Entegrasyonu** | Gerçek borsa API'leri | CoinGecko, Yahoo Finance vb. ile gerçek fiyat verisi |
| **Banka Entegrasyonu** | Open Banking API | PSD2 uyumlu banka hesap entegrasyonu |
| **Mobil Uygulama** | React Native veya Flutter | iOS/Android mobil uygulama |
| **Test Altyapısı** | Jest, Cypress | Birim testler ve uçtan uca (E2E) testler |
| **CI/CD** | GitHub Actions | Otomatik build, test ve dağıtım pipeline'ı |

---

**FinUp** — Tezsiz Yüksek Lisans Bitirme Projesi

Node.js • Express.js • PostgreSQL • Redis • React • Vite • Chart.js • Docker Compose
