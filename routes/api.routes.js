const express = require("express");
const router = express.Router();
const apiController = require("../controllers/api.controller");
const verificarJWTAdmin = require("../middlewares/verificarJWTAdmin");
const usuariosModel = require("../models/usuario.model"); // <-- Línea agregada

// Login de administrador (SIN protección)
router.post("/login", apiController.loginAdmin);

// Rutas protegidas con JWT (a partir de aquí)
router.use(verificarJWTAdmin);

// Obtener cantidad de cursos publicados / no publicados
router.get("/cursos/cantidad", apiController.cantidadCursos);

// Crear curso
router.post("/cursos", apiController.crearCurso);

// Publicar curso por ID
router.put("/cursos/:id/publicar", apiController.publicarCurso);

// ==================== NUEVO ENDPOINT ====================
// Obtener cantidad de profesores (protegido por JWT)
router.get("/profesores/cantidad", async (req, res) => {
  try {
    const profesores = await usuariosModel.listarProfesores();
    res.json({ cantidad: profesores.length });
  } catch (error) {
    res.status(500).json({ error: "Error al contar profesores" });
  }
});
// ========================================================

module.exports = router;