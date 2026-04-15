const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// SERVE FRONTEND (INI PENTING BANGET)
app.use(express.static(path.join(__dirname, '../client')));

// SET STORAGE UPLOAD
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'storage/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ROUTE TEST
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ROUTE UPLOAD
app.post('/api/upload-jawaban', upload.single('file'), (req, res) => {
  const { nama, kelas } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File kosong'
    });
  }

  console.log({
    nama,
    kelas,
    file: req.file.filename
  });

  res.json({ success: true });
});

// JALANKAN SERVER
app.listen(3000, () => {
  console.log('Server running di http://localhost:3000');
});