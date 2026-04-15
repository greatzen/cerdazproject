const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const uploadPath = path.join(__dirname, 'storage/uploads');

// pastikan folder ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// SERVE FRONTEND (INI PENTING BANGET)
app.use(express.static(path.join(__dirname, 'client')));

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

const upload = multer({
  dest: 'temp/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('FORMAT_FILE_TIDAK_VALID'), false);
    }
  }
});

// ROUTE TEST
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'client/index.html'));
});

// ROUTE UPLOAD
app.post('/api/upload-jawaban', upload.single('file'), async (req, res) => {
  const { nama, kelas } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File kosong'
    });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
        context: {
            nama: nama,
            kelas: kelas
        }
    });

    console.log({
      nama,
      kelas,
      file_url: result.secure_url
    });

    res.json({
      success: true,
      url: result.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Upload gagal'
    });
  }
});

app.use((err, req, res, next) => {
  if (err.message === 'FORMAT_FILE_TIDAK_VALID') {
    return res.status(400).json({
      success: false,
      message: 'File harus berupa gambar (jpg, jpeg, png)'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server'
  });
});


// JALANKAN SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running di port ${PORT}`);
});