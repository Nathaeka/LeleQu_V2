# LeleQu — Website Resmi, CMS & NestJS Backend (BAB 9)

Aplikasi web perusahaan akuakultur modern **LeleQu** (Budidaya & Pasokan Ikan Lele Segar, Sistem Pickup Only) yang kini dilengkapi backend **NestJS (MVC Architecture)** untuk pengelolaan CRUD data produk.

## Deskripsi Proyek

Proyek ini terdiri dari dua bagian dalam satu repository:
- **Frontend (`src/`)**: Website publik (Beranda, Tentang Kami, Katalog Produk, Pemesanan Pickup Only, Artikel Edukasi, Kontak) dan Dashboard Admin CMS (`/admin`) menggunakan React + Vite + JavaScript + Tailwind CSS.
- **Backend (`backend/`)**: REST API berbasis NestJS + TypeScript dengan struktur MVC (`Module`, `Controller`, `Service`, `Entity`, `DTO`) yang mengelola resource `products` menggunakan penyimpanan array sementara di memori.

> **Catatan Penyimpanan Data (In-Memory):**  
> Pada tahap implementasi BAB 9 ini, backend belum menggunakan database maupun ORM. Data produk disimpan di dalam array memori di `ProductsService`, sehingga setiap perubahan (`POST`, `PATCH`, `DELETE`) akan kembali ke 5 data awal apabila server backend direstart.

---

## Teknologi yang Digunakan

### Frontend
- React 19 + React Router DOM 7
- Vite 8
- JavaScript (JSX)
- Tailwind CSS v4
- Lucide React Icons

### Backend
- NestJS 11 (TypeScript)
- `class-validator` & `class-transformer`
- `@nestjs/mapped-types`
- REST Client (`products.http`) untuk pengujian endpoint

---

## Struktur Folder

```text
.
├── backend/
│   ├── src/
│   │   ├── products/
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   └── update-product.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.controller.spec.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.service.spec.ts
│   │   │   └── products.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── screenshots/
│       └── README.md
├── public/
│   ├── assets/foto/
│   └── data/
├── src/
│   ├── components/
│   ├── config/
│   │   └── api.js
│   ├── context/
│   │   └── AppContext.jsx
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   │   └── productApi.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── products.http
├── README.md
└── vite.config.js
```

---

## Instalasi Dependency

Frontend dan backend memiliki `package.json` terpisah sehingga dapat diinstal dan dijalankan secara mandiri.

### 1. Instalasi Dependency Frontend (Root)
```bash
npm install
```

### 2. Instalasi Dependency Backend (`backend/`)
```bash
cd backend
npm install
```

---

## Cara Menjalankan Frontend dan Backend

Jalankan **2 terminal terpisah**:

### Terminal 1 — Menjalankan Backend NestJS (Port `3001`)
```bash
cd backend
npm run start:dev
```
API backend akan berjalan pada `http://localhost:3001` (dapat diubah via environment variable `PORT`).

### Terminal 2 — Menjalankan Frontend React + Vite (Port `3000`)
```bash
npm run dev
```
Aplikasi frontend berjalan pada `http://localhost:3000`.  
Konfigurasi base URL API frontend berada di `src/config/api.js` dan dapat disesuaikan menggunakan variabel `VITE_API_BASE_URL` (lihat `.env.example`).

---

## Daftar Endpoint API (`ProductsController`)

| HTTP Method | Endpoint | Fungsi | Status Sukses |
|---|---|---|---|
| `GET` | `/products` | Mengambil seluruh daftar produk | `200 OK` |
| `GET` | `/products/:id` | Mengambil detail produk berdasarkan ID | `200 OK` |
| `POST` | `/products` | Menambahkan produk baru | `201 Created` |
| `PATCH` | `/products/:id` | Mengubah sebagian/seluruh data produk | `200 OK` |
| `DELETE` | `/products/:id` | Menghapus produk berdasarkan ID | `200 OK` |

Seluruh response menggunakan format JSON yang konsisten:
```json
{
  "statusCode": 200,
  "message": "Daftar produk berhasil diambil.",
  "data": []
}
```

---

## Implementasi CRUD, Entity, Validasi & Exception

### 1. Product Entity (`backend/src/products/entities/product.entity.ts`)
Entity `Product` merepresentasikan produk katalog LeleQu dengan tipe data bervariasi:
- `id: number`
- `name: string`
- `slug: string`
- `description: string`
- `category: string`
- `price: number`
- `image: string`
- `minOrder: string`
- `characteristics: string[]`
- `isAvailable: boolean`
- `createdAt: Date`

### 2. Operasi CRUD (`backend/src/products/products.service.ts`)
- `create()`: Membuat produk dengan ID unik auto-increment (`nextId`), slug otomatis, dan timestamp `createdAt`.
- `findAll()`: Mengembalikan seluruh daftar produk dari array in-memory.
- `findOne(id)`: Mengambil detail produk berdasarkan ID numerik.
- `update(id, dto)`: Memperbarui field produk sesuai input yang dikirim.
- `remove(id)`: Menghapus produk dari array berdasarkan ID.

### 3. Validasi DTO & Global ValidationPipe
- `CreateProductDto` menggunakan `class-validator`: `@IsString()`, `@IsNotEmpty()`, `@MinLength()`, `@IsNumber()`, `@Min()`, `@IsArray()`, `@IsBoolean()`, `@IsOptional()`.
- `UpdateProductDto` mewarisi aturan opsional melalui `PartialType(CreateProductDto)`.
- `main.ts` mengaktifkan `ValidationPipe` secara global dengan `whitelist: true`, `forbidNonWhitelisted: true`, dan `transform: true`, serta konfigurasi CORS agar frontend React di port `3000`/`5173` dapat berkomunikasi dengan backend.

### 4. Penanganan Exception
- `NotFoundException` (`404 Not Found`): Dilempar saat `findOne`, `update`, atau `remove` dipanggil dengan ID yang tidak ada.
- `ConflictException` (`409 Conflict`): Dilempar saat `create` atau `update` menggunakan nama atau slug produk yang sudah terdaftar.
- `BadRequestException` (`400 Bad Request`): Dihasilkan otomatis oleh `ValidationPipe` atau `ParseIntPipe` saat input/ID tidak valid.

---

## Dokumentasi Pengujian REST Client (`products.http`)

Buka file `products.http` di VS Code (dengan ekstensi **REST Client** terpasang), pastikan server backend aktif di `http://localhost:3001`, lalu klik **Send Request** pada masing-masing skenario:
1. `GET /products` — Mengambil seluruh produk.
2. `GET /products/1` — Mengambil detail produk ID 1.
3. `POST /products` — Menambah produk baru dengan data valid.
4. `PATCH /products/1` — Memperbarui harga dan minimal order produk ID 1.
5. `DELETE /products/6` — Menghapus produk baru yang dibuat pada langkah 3.
6. `POST /products` (invalid payload) — Menguji validasi `400 Bad Request`.
7. `GET /products/9999` & `DELETE /products/9999` — Menguji `404 Not Found`.
8. `POST /products` (duplikat) — Menguji `409 Conflict`.

---

## Panduan Screenshot Dokumentasi (`docs/screenshots/`)

Simpan hasil tangkapan layar asli dari VS Code dan browser ke dalam folder `docs/screenshots/` dengan penamaan berikut:
- `01-project-structure.png`
- `02-nest-resource.png`
- `03-product-entity.png`
- `04-crud-service.png`
- `05-controller-endpoints.png`
- `06-dto-validation.png`
- `07-global-validation-pipe.png`
- `08-get-products.png`
- `09-post-products.png`
- `10-patch-products.png`
- `11-delete-products.png`
- `12-frontend-integration.png`
