const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/categorias/");
  },
  filename: (req, file, cb) => {
    const idCategoria = req.params.id || Date.now(); // para crear o editar
    const ext = path.extname(file.originalname);
    cb(null, `${idCategoria}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, png, gif)"));
  }
};

module.exports = multer({ storage, fileFilter });
