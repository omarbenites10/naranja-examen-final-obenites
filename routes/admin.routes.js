const express = require("express");
const adminRouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cursoController = require("../controllers/curso.controller");
const adminController = require("../controllers/admin/admin.controller");
const inscripcionController = require("../controllers/inscripciones.controller");

const usuariosModel = require("../models/usuario.model");
const cursosModel = require("../models/curso.model");

const validarCurso = require("../middlewares/validarCurso.middleware");
const validarAdmin = require("../middlewares/validarAdmin");
const {
  validarInscripcion,
} = require("../middlewares/validarInscripcion.middleware");

const inscripcionesModel = require("../models/inscripciones.model");
const logHomeAccess = require("../middlewares/logHome.middleware");
const upload = require("../middlewares/upload.middleware");


// Configuración de multer (antes de usar upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/cursos");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Extensión no válida. Solo se permiten .jpg, .jpeg, .png"));
  }
};

const uploadimagen = multer({ storage, fileFilter });

// === VALIDAR ADMIN ===
adminRouter.use(validarAdmin);

// === HOME ADMIN ===
adminRouter.get("/home", logHomeAccess, adminController.home);

// === NUEVA RUTA: ESTADÍSTICAS GENERALES ===
adminRouter.get("/estadisticas", adminController.verEstadisticas);

// === RUTAS PARA CREAR CURSO ===
adminRouter.get("/cursos/nuevo", cursoController.formulario);
adminRouter.post("/cursos", validarCurso, cursoController.guardar);

// === RUTAS PARA VER CURSO ADMIN ===
adminRouter.get("/cursos", adminController.listarCursosAdmin);
adminRouter.get("/cursos/:id/ver", adminController.verCursoAdmin);

// === RUTAS PARA EDITAR CURSO ADMIN ===
adminRouter.get("/cursos/:id/editar", adminController.formEditarCurso);
adminRouter.post("/cursos/:id/editar", uploadimagen.single("imagen"), adminController.editarCurso);

// === RUTAS PARA ASIGNAR PROFESOR ===
adminRouter.get("/asignar-profesor", adminController.vistaAsignarProfesor);
adminRouter.post("/asignar-profesor", adminController.insertarAsignacion);

// === RUTAS PARA USUARIOS ===
adminRouter.get("/usuarios", adminController.listarUsuarios);
adminRouter.get("/usuarios/nuevo", adminController.formCrearUsuario);
adminRouter.post("/usuarios/nuevo", adminController.crearUsuario);

// === RUTAS PARA EDITAR USUARIO ===
adminRouter.get("/usuarios/:id/editar", adminController.formEditarUsuario);
adminRouter.post("/usuarios/:id", adminController.editarUsuario);

// === RUTAS PARA INSCRIPCIONES ===
adminRouter.get("/inscripciones", inscripcionController.listar);
adminRouter.post("/inscripciones/eliminar/:id", inscripcionController.eliminar);
adminRouter.get("/inscripciones/nueva", inscripcionController.formulario);
adminRouter.post(
  "/inscripciones",
  validarInscripcion,
  inscripcionController.inscribir
);

// === RUTAS PARA CATEGORÍAS ===
adminRouter.get("/categorias", adminController.listarCategorias);
adminRouter.get("/categorias/nueva", adminController.formNuevaCategoria);
adminRouter.post(
  "/categorias",
  upload.single("imagen"),
  adminController.crearCategoria
);
adminRouter.post("/categorias/eliminar/:id", adminController.eliminarCategoria);
adminRouter.get("/categorias/editar/:id", adminController.formEditarCategoria);
adminRouter.post(
  "/categorias/editar/:id",
  upload.single("imagen"),
  adminController.editarCategoria
);

// === RUTA PARA VER ASIGNACIONES DE PROFESORES ===
adminRouter.get("/asignaciones-profesor", adminController.verAsignacionesProfesor);

// Ruta para eliminar asignación usando POST
adminRouter.post("/asignaciones-profesor/:id_asignacion/eliminar", adminController.eliminarAsignacion);

module.exports = adminRouter;
