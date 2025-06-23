const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/cursos");
  },
  filename: (req, file, cb) => {
    const idCurso = req.params.idCurso || Date.now(); // usar Date.now si es nuevo
    const ext = path.extname(file.originalname);
    cb(null, `${idCurso}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos JPG o PNG."));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
