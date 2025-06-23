const express = require("express");
const authRouter = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const authController = require("../controllers/auth/auth.controller");
const cursoController = require("../controllers/curso.controller");
const { validarLogin } = require("../middlewares/validarAuth");
const logHomeAccess = require("../middlewares/logHome.middleware");
const validarSesion = require("../middlewares/validarSesion.middleware");

// Redirección a home
authRouter.get("/", authController.redirectHome);

// Página principal después de iniciar sesión
authRouter.get("/home", logHomeAccess, authController.home);

// Mostrar formulario de login
authRouter.get("/login", authController.mostrarLogin);

// Procesar login de alumno/profesor
authRouter.post("/login", validarLogin, authController.login);

// Login exclusivo para administrador
authRouter.post("/admin/login", authController.loginAdmin);
authRouter.post("/admin/login-test", authController.loginAdminTest);

// Logout general
authRouter.post("/logout", authController.logout);

// Funcionalidades de cursos
authRouter.get("/buscar", cursoController.buscarCurso);
authRouter.get("/mis-cursos-alumno", cursoController.verMisCursos);
authRouter.get("/mis-cursos-profesor", cursoController.miCursoProfesor);
authRouter.get("/profesores", cursoController.verProfesores);
authRouter.get("/team", authController.mostrarTeam);
authRouter.get("/curso/:idCurso", cursoController.verCurso);
authRouter.post("/curso/:idCurso/inscribirme", cursoController.inscribirmeComoAlumno);
authRouter.post("/curso/:idCurso/agregar-seccion", cursoController.agregarSeccion);
authRouter.post("/curso/:idCurso/publicar", cursoController.publicarCurso);
authRouter.get("/validar-mis-cursos", authController.validarMisCursos);
authRouter.post('/curso/:id/valorar', cursoController.valorarCurso);

authRouter.get('/admin-login/login', (req, res) => {
  res.render('public/admin-login/login', { error: null });
});

// Cambio de contraseña
authRouter.get("/cambiar-contrasena", authController.formularioCambio);
authRouter.post("/cambiar-contrasena", authController.cambiarContrasena);

// Ver y guardar mis datos
authRouter.get("/mis-datos", validarSesion, authController.vistaMisDatos);
authRouter.post("/mis-datos", validarSesion, authController.guardarMisDatos);

// 🔻 NUEVAS RUTAS PARA DAR DE BAJA CUENTA 🔻
authRouter.get("/baja-cuenta", validarSesion, authController.formularioBajaCuenta);
authRouter.post("/baja-cuenta", validarSesion, authController.procesarBajaCuenta);

//COFIGURACION PARA MANEJO DE IMAGEN DE PERFIL
// Configurar multer para archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para subir o reemplazar foto de perfil
authRouter.post("/subir-foto", upload.single("foto"), (req, res) => {
  if (!req.session.usuario) return res.redirect("/public/auth-login");

  const usuario = req.session.usuario;
  const id = usuario.email_usuario || usuario.email;

  if (!id) {
    console.error("No se pudo determinar el identificador del usuario (email_usuario o email)");
    return res.status(400).send("Error: No se pudo obtener el identificador del usuario.");
  }

  const carpeta = path.join(__dirname, "../assets/profile");
  const extension = path.extname(req.file.originalname).toLowerCase();
  const nombreNuevo = `${id}${extension}`;
  const rutaCompleta = path.join(carpeta, nombreNuevo);

  fs.readdir(carpeta, (err, files) => {
    if (err) {
      console.error("Error al leer la carpeta:", err);
      return res.status(500).send("Error al procesar imagen");
    }

    files.forEach((file) => {
      // ⚠️ Asegúrate de que file sea una cadena válida
      if (file && file.startsWith(id) && file !== nombreNuevo) {
        try {
          fs.unlinkSync(path.join(carpeta, file));
        } catch (err) {
          console.error("Error al eliminar imagen anterior:", err);
        }
      }
    });

    // Guardar nuevo archivo
    try {
      fs.writeFileSync(rutaCompleta, req.file.buffer);
      console.log("Imagen guardada:", nombreNuevo);
    } catch (err) {
      console.error("Error al guardar imagen:", err);
      return res.status(500).send("Error al guardar imagen");
    }

    res.redirect("/auth/home");
  });
});


module.exports = authRouter;