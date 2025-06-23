const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../assets/categorias");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombreAleatorio = `${Date.now()}${ext}`;
    cb(null, nombreAleatorio);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExt = [".jpg", ".jpeg", ".png", ".webp"];
    if (!validExt.includes(ext)) {
      return cb(new Error("Formato de imagen no válido"));
    }
    cb(null, true);
  },
});

module.exports = upload;
