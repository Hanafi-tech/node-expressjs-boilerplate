# 📦 Library Samples

Folder ini berisi **contoh implementasi siap pakai** untuk setiap library yang ada di `package.json`.
Tidak ada yang di-load otomatis — salin atau import sesuai kebutuhan.

---

## Daftar Sample

| File | Libraries | Kegunaan |
|---|---|---|
| `httpClient.sample.js` | `axios`, `qs`, `form-data` | HTTP request ke external API |
| `excel.sample.js` | `exceljs`, `xlsx`, `adm-zip` | Generate & parse Excel, ZIP file |
| `pdf.sample.js` | `puppeteer`, `pdf-lib`, `ejs` | Generate PDF dari HTML, merge, watermark |
| `openai.sample.js` | `openai` | Chat AI, multi-turn, embedding |
| `upload.sample.js` | `multer`, `mime-types`, `nanoid` | Upload file, deteksi MIME, unique ID |
| `utility.sample.js` | `dayjs`, `xml2js`, `tunnel-ssh`, `express-session` | Tanggal, XML, SSH tunnel, session |

---

## Cara Pakai

### 1. HTTP Client (axios)

```js
const { get, postJson, postForm, postMultipart } = require('@my_module/samples/httpClient.sample');

// GET dengan query params
const users = await get('https://api.example.com', '/users', { page: 1, limit: 10 });

// POST JSON
const result = await postJson('https://api.example.com', '/orders', { item: 'A', qty: 2 });

// POST form-urlencoded
const token = await postForm('https://oauth.example.com', '/token', {
  grant_type: 'client_credentials',
  client_id: 'xxx',
  client_secret: 'yyy',
});

// POST dengan file
const uploaded = await postMultipart('https://cdn.example.com', '/upload', {
  fieldName: 'file',
  filePath: '/tmp/photo.jpg',
  extraFields: { folder: 'avatars' },
});
```

---

### 2. Export Excel

```js
const { generateExcel, parseUploadedExcel } = require('@my_module/samples/excel.sample');

// Export (di controller)
const exportHandler = async (req, res) => {
  const columns = [
    { header: 'Nama',  key: 'name',  width: 20 },
    { header: 'Email', key: 'email', width: 30 },
  ];
  const rows = [{ name: 'Budi', email: 'budi@example.com' }];
  await generateExcel(res, 'Data Users', columns, rows, 'users-2026');
};

// Import (parse Excel yang di-upload)
const importHandler = async (req, res) => {
  const rows = parseUploadedExcel(req.files.file.data);
  return res.json({ total: rows.length, data: rows });
};
```

---

### 3. Generate PDF

```js
const { renderPdf, htmlToPdf, mergePdfs, addWatermark } = require('@my_module/samples/pdf.sample');

// Dari template EJS (src/lib/samples/templates/invoice.ejs)
const downloadInvoice = async (req, res) => {
  await renderPdf(res, 'invoice', {
    invoiceNo: 'INV-001',
    date: '2026-07-25',
    items: [{ name: 'Produk A', qty: 2, price: 150000 }],
    total: 300000,
  }, 'Invoice-INV-001');
};

// Dari HTML string
const pdfBuffer = await htmlToPdf('<h1>Hello PDF</h1>');

// Watermark
const watermarked = await addWatermark(pdfBuffer, 'DRAFT');
```

---

### 4. AI Chat (OpenAI)

Setup `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

```js
const { chat, chatMultiTurn } = require('@my_module/samples/openai.sample');

// Single message
const reply = await chat('Apa itu REST API?', 'Kamu adalah asisten teknologi.');

// Multi-turn dengan history
const { reply, usage } = await chatMultiTurn(
  'Jelaskan lebih detail',
  [{ role: 'user', content: 'Apa itu REST API?' }, { role: 'assistant', content: '...' }],
  'Kamu adalah asisten teknologi.'
);
```

---

### 5. Upload File (multer)

```js
const { uploadImage, uploadDocument } = require('@my_module/samples/upload.sample');

// Di route:
router.post('/upload/photo',    uploadImage.single('photo'),    ctrl.uploadPhoto);
router.post('/upload/document', uploadDocument.single('file'),  ctrl.uploadDoc);
router.post('/upload/gallery',  uploadImage.array('images', 5), ctrl.uploadGallery);

// Di controller:
const uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'File wajib diupload.' });
  return res.json({ url: `/img/${req.file.filename}` });
};
```

---

### 6. Manipulasi Tanggal (dayjs)

```js
const { date } = require('@my_module/samples/utility.sample');

date.now()                          // '2026-07-25 14:30:00'
date.format('2026-07-25', 'DD MMMM YYYY')  // '25 Juli 2026'
date.addDays('2026-07-25', 30)      // dayjs object 30 hari ke depan
date.diffDays('2026-07-01', '2026-07-25')  // 24
date.fromNow('2026-07-20')          // '5 hari yang lalu'
date.startOfMonth('2026-07-15')     // '2026-07-01'
date.endOfMonth('2026-07-15')       // '2026-07-31'
```

---

### 7. Parse XML (xml2js)

```js
const { parseXml, buildXml } = require('@my_module/samples/utility.sample');

const xml = `<user><name>Budi</name><role>admin</role></user>`;
const obj = await parseXml(xml);
// → { user: { name: 'Budi', role: 'admin' } }

const backToXml = buildXml({ user: { name: 'Budi', role: 'admin' } });
```

---

### 8. SSH Tunnel (untuk akses DB internal)

Setup `.env`:
```
SSH_HOST=bastion.example.com
SSH_PORT=22
SSH_USER=ubuntu
SSH_PRIVATE_KEY_PATH=/home/user/.ssh/id_rsa
SSH_DB_HOST=10.0.0.5
SSH_DB_PORT=5432
SSH_LOCAL_PORT=15432
```

```js
const { createSshTunnel } = require('@my_module/samples/utility.sample');

// Buka tunnel sebelum Sequelize connect (di app.js)
if (process.env.USE_SSH_TUNNEL === 'true') {
  await createSshTunnel();
}
```

---

### 9. Nanoid — Unique ID

```js
const { nanoid } = require('nanoid');

nanoid()     // 'V1StGXR8_Z5jdHi6B-myT'  (21 char)
nanoid(10)   // 'IRFa-VaY2b'              (10 char)
nanoid(6)    // 'abc123'                  (6 char)

// Contoh penggunaan:
const orderCode  = `ORD-${nanoid(8).toUpperCase()}`;  // ORD-AB12CD34
const uploadName = `${nanoid(10)}-${Date.now()}.jpg`; // abc123xyz0-1720000000000.jpg
```

---

### 10. Libraries yang sudah aktif di boilerplate

| Library | Digunakan di |
|---|---|
| `@casl/ability` | `middleware/abilities.js` — RBAC permission check |
| `bcryptjs` | `models/usersModel.js`, `controllers/authController.js` |
| `cookie-session` | `app.js` — session management |
| `cors` | `app.js` |
| `express-validator` | `middleware/validators/` |
| `helmet` | `app.js` |
| `jsonwebtoken` | `controllers/authController.js`, `middleware/authJwt.js` |
| `kafkajs` | `config/kafka.js` |
| `morgan` | `middleware/morganLogsEvent.js` |
| `nodemailer` | `lib/services/emailService.js` |
| `node-cron` | `cron/index.js` |
| `otpauth` | `controllers/authController.js`, `controllers/settings/profileController.js` |
| `qrcode` | `controllers/settings/profileController.js` — MFA QR code |
| `redis` | `config/redis.js`, `middleware/authJwt.js`, `middleware/abilities.js` |
| `rotating-file-stream` | `middleware/morganLogsEvent.js` |
| `sequelize` + `pg` | ORM + PostgreSQL driver |
| `socket.io` | `lib/socket.js` — realtime notification |
| `swagger-jsdoc` + `swagger-ui-express` | `config/swaggerConfig.js` |
| `winston` + `winston-daily-rotate-file` | `config/logger.js` |
| `xss-clean` | `app.js` |
