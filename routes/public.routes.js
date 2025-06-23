const express = require("express");
const publicRouter = express.Router();

// Controllers
const publicController = require("../controllers/public/public.controller");
const loginController = require("../controllers/public/login.controller");

// Middleware
const validarLogin = require("../middlewares/validarLogin.middleware");
const logHomeAccess = require("../middlewares/logHome.middleware");

// Página principal pública
publicRouter.get("/home", logHomeAccess, publicController.home);

// Página "Mis Cursos" (funciona para alumnos o profesores)
publicRouter.get("/mis-cursos", publicController.misCursos);

// Página "Sobre Nosotros"
publicRouter.get("/about", publicController.about);

// Página pública con listado de profesores
publicRouter.get("/profesores", publicController.verProfesores);

// Página de contacto
publicRouter.get("/contact", publicController.contact);

// Página de política de privacidad
publicRouter.get("/privacy", publicController.privacy);

// Página de términos y condiciones
publicRouter.get("/termycondic", publicController.terms);

// Página de preguntas frecuentes
publicRouter.get("/preguntasfrecuentes", publicController.faq);

// Página de cookies
publicRouter.get("/cookies", publicController.cookies);

// Página de ayuda
publicRouter.get("/help", publicController.help);

// Login para Administrador
publicRouter.get("/admin-login", loginController.mostrarLoginAdmin);
publicRouter.post("/admin-login", validarLogin, loginController.loginAdmin);

// Login para Usuarios (Alumnos / Profesores)
publicRouter.get("/auth-login/try", loginController.mostrarLoginAuth);
publicRouter.post("/auth-login/try", validarLogin, loginController.loginAuth);

publicRouter.get("/categoria/:id", publicController.verCursosPorCategoria);

// *** Registro de nuevos usuarios ***
publicRouter.get("/registro", loginController.mostrarRegistro); // Muestra el formulario
publicRouter.post("/registro", loginController.registroUsuario); // Procesa el registro

module.exports = publicRouter;
