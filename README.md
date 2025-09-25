<h1 align="center">Akuna Backend</h1>

<div align="center">
  <img src="./uploads/Logo sakinah.png" alt="Akuna Logo" width="200"/>
  <p><em>Akuna</em></p>
</div>

<div align="center">

_Empowering Healthcare System with Seamless Technology Integration_

<!-- ![Go](https://img.shields.io/badge/go-100%25-00ADD8?style=flat-square&logo=go&logoColor=white) -->
<!-- ![Languages](https://img.shields.io/badge/Languages-1-blue?style=flat-square) -->

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) 
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) 
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) 
<!-- ![Go](https://img.shields.io/badge/go-100%25-00ADD8?style=flat-square&logo=go&logoColor=white)  -->
![Languages](https://img.shields.io/badge/Languages-1-blue?style=flat-square)

**Built with the tools and technologies:**

<!-- ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![Blade](https://img.shields.io/badge/Blade-E44D26?style=flat-square&logo=laravel&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Composer](https://img.shields.io/badge/Composer-885630?style=flat-square&logo=composer&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=flat-square&logo=jquery&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white)
![GNU Bash](https://img.shields.io/badge/GNU%20Bash-4EAA25?style=flat-square&logo=gnubash&logoColor=white) -->

<!-- ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white) -->

---

</div>

---

## Fitur Utama

- **Autentikasi Pengguna**: Sistem registrasi dan login yang aman menggunakan JWT (JSON Web Tokens).
- **Manajemen User**: Pengguna dapat mendaftar dengan peran default sebagai "Pembeli".
- **Sistem Affiliate**: Alur pendaftaran bagi pengguna untuk mengajukan diri menjadi "Affiliate".
- **Database Modern**: Menggunakan PostgreSQL dengan Sequelize sebagai ORM untuk interaksi database yang efisien dan aman.
- **Ditulis dengan TypeScript**: Menjamin _type-safety_ dan skalabilitas kode.

---

## Teknologi yang Digunakan

- **Runtime**: Node.js
- **Framework**: Express.js
- **Bahasa**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Autentikasi**: JSON Web Token (JWT), bcrypt (untuk hashing password)
- **Development Tools**: Nodemon, ts-node

---

## Instalasi dan Setup

Ikuti langkah-langkah berikut untuk menjalankan proyek ini secara lokal.

### 1\. Prasyarat

Pastikan Anda sudah menginstall perangkat lunak berikut di mesin Anda:

- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- [NPM](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/)

### 2\. Clone Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 3\. Install Dependensi

```bash
npm install
```

### 4\. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya dengan konfigurasi lokal Anda.

```bash
cp .env.example .env
```

Isi file `.env` Anda seperti contoh berikut:

```env
# Server Configuration
PORT=3000

# Database Configuration (Ganti dengan data Anda)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=affiliate_db
DB_PORT=5432

# JWT Secret Key (Ganti dengan kunci rahasia yang kuat)
JWT_SECRET=your_super_secret_key_for_jwt
```

### 5\. Setup Database

Pastikan server PostgreSQL Anda berjalan dan buatlah sebuah database baru dengan nama yang sesuai dengan `DB_NAME` di file `.env` Anda (contoh: `affiliate_db`).

---

## Menjalankan Aplikasi

### Mode Development

Untuk menjalankan server dalam mode development dengan _hot-reloading_ (otomatis restart saat ada perubahan kode):

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000` atau port yang Anda tentukan di `.env`.

### Mode Produksi

Untuk membangun dan menjalankan versi produksi:

```bash
# 1. Build TypeScript ke JavaScript
npm run build

# 2. Jalankan hasil build
npm run start
```

---

## API Endpoints

Berikut adalah dokumentasi endpoint API yang tersedia saat ini.

### Autentikasi (`/api/auth`)

| Method | Endpoint    | Deskripsi                        | Auth? |
| :----- | :---------- | :------------------------------- | :---- |
| `POST` | `/register` | Mendaftarkan pengguna baru.      | Tidak |
| `POST` | `/login`    | Login dan mendapatkan JWT token. | Tidak |

#### `POST /api/auth/register`

Mendaftarkan pengguna baru dengan peran default 'pembeli'.

**Request Body:**

```json
{
  "name": "Budi Sanjaya",
  "email": "budi.sanjaya@example.com",
  "password": "passwordKuat123",
  "alamat": "Jl. Teknologi No. 1, Yogyakarta"
}
```

**Success Response (201):**

```json
{
  "message": "Registrasi berhasil!",
  "user": {
    "id": 1,
    "name": "Budi Sanjaya",
    "email": "budi.sanjaya@example.com"
  }
}
```

#### `POST /api/auth/login`

Mengautentikasi pengguna dan mengembalikan token.

**Request Body:**

```json
{
  "email": "budi.sanjaya@example.com",
  "password": "passwordKuat123"
}
```

**Success Response (200):**

```json
{
  "message": "Login berhasil!",
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": 1,
    "name": "Budi Sanjaya",
    "email": "budi.sanjaya@example.com",
    "role": "pembeli"
  }
}
```

### Pengguna (`/api/users`)

| Method | Endpoint           | Deskripsi                                 | Auth? |
| :----- | :----------------- | :---------------------------------------- | :---- |
| `POST` | `/apply-affiliate` | Mengajukan pendaftaran sebagai affiliate. | Ya    |

#### `POST /api/users/apply-affiliate`

Mengubah peran pengguna yang sedang login dari `pembeli` menjadi `affiliate`. Membutuhkan token JWT pada header `Authorization`.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "message": "Selamat! Anda berhasil mendaftar sebagai affiliate."
}
```

---

## Struktur Proyek

Proyek ini menggunakan struktur yang dirancang untuk skalabilitas:

```
src/
├── config/         # Konfigurasi database dan environment
├── controllers/    # Logika untuk menangani request dan response
├── middlewares/    # Middleware (e.g., pengecekan autentikasi)
├── models/         # Definisi model Sequelize (skema tabel)
├── routes/         # Definisi endpoint API
└── index.ts        # Entry point aplikasi Express
```
