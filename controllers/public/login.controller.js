const usuariosModel = require("../../models/usuario.model");
const tipousuariosModel = require("../../models/tipo.usuario.model");
const asignacionesModel = require("../../models/asignaciones.model");
const inscripcionesModel = require("../../models/inscripciones.model");
const agregarLogAdmin = require("../../utils/logAdmin");

const bcrypt = require("bcryptjs");

const loginController = {
  mostrarLoginAdmin: (req, res) => {
    res.render("public/admin-login/login", { error: null });
  },

  loginAdmin: async (req, res) => {
    const { email, contrasena } = req.body;

    try {
      const resultadoEmail = await usuariosModel.buscarPorEmail(email);

      if (resultadoEmail.length === 0) {
        agregarLogAdmin({
          usuario: email,
          recurso: "Login ADMIN",
          id: "Fallido - Correo no registrado",
        });
        return res.render("public/admin-login/login", {
          error: "El correo no está registrado.",
        });
      }

      const usuario = resultadoEmail[0];

      const passwordValida = await bcrypt.compare(
        contrasena,
        usuario.contrasena
      );
      if (!passwordValida) {
        agregarLogAdmin({
          usuario: email,
          recurso: "Login ADMIN",
          id: "Fallido - Contraseña incorrecta",
        });
        return res.render("public/admin-login/login", {
          error: "Contraseña incorrecta.",
        });
      }

      const resultadoTipo = await tipousuariosModel.buscarTipoPorEmail(email);
      const tipo = resultadoTipo[0]?.nom_tipo_usuario;

      if (tipo === "A") {
        req.session.usuario = {
          email: usuario.email_usuario,
          nombre: usuario.nombre,
          tipo,
        };
        agregarLogAdmin({
          usuario,
          recurso: "Login ADMIN",
          id: "Exitoso",
        });
        return res.redirect("/admin/home");
      } else {
        agregarLogAdmin({
          usuario: email,
          recurso: "Login ADMIN",
          id: "Fallido - No es administrador",
        });
        return res.render("public/admin-login/login", {
          error: "No tenés permisos de administrador.",
        });
      }
    } catch (err) {
      console.error("Error en login admin:", err);
      agregarLogAdmin({
        usuario: email,
        recurso: "Login ADMIN",
        id: "Fallido - Error interno",
      });
      return res.render("public/admin-login/login", {
        error: "Error interno al iniciar sesión.",
      });
    }
  },

  mostrarLoginAuth: (req, res) => {
    res.render("public/auth-login/loginAuth", {
      errores: [],
      oldData: {},
    });
  },

  loginAuth: async (req, res) => {
    const { email, contrasena } = req.body;

    try {
      const resultadoEmail = await usuariosModel.buscarPorEmail(email);
      if (resultadoEmail.length === 0) {
        agregarLogAdmin({
          usuario: email,
          recurso: "Login USER",
          id: "Fallido - Correo no registrado",
        });
        return res.render("public/auth-login/loginAuth", {
          errores: ["El correo no está registrado."],
          oldData: { email },
        });
      }

      const usuario = resultadoEmail[0];

      const passwordValida = await bcrypt.compare(
        contrasena,
        usuario.contrasena
      );
      if (!passwordValida) {
        agregarLogAdmin({
          usuario,
          recurso: "Login USER",
          id: "Fallido - Contraseña incorrecta",
        });
        return res.render("public/auth-login/loginAuth", {
          errores: ["Contraseña incorrecta."],
          oldData: { email },
        });
      }

      const esProfesor = await asignacionesModel.existeAsignacion(email);
      const esAlumno = await inscripcionesModel.existeInscripcion(email);

      if (esProfesor || esAlumno) {
        req.session.usuario = {
          email: usuario.email_usuario,
          nombre: usuario.nombre,
          esProfesor,
          esAlumno,
        };
        agregarLogAdmin({
          usuario,
          recurso: "Login USER",
          id: "Exitoso",
        });
        return res.redirect("/auth/home");
      } else {
        agregarLogAdmin({
          usuario,
          recurso: "Login USER",
          id: "Fallido - Sin asignaciones ni inscripciones",
        });
        return res.render("public/auth-login/loginAuth", {
          errores: ["No tenés acceso a la plataforma como alumno o profesor."],
          oldData: { email },
        });
      }
    } catch (error) {
      console.error("Error en login auth:", error);
      agregarLogAdmin({
        usuario: email,
        recurso: "Login USER",
        id: "Fallido - Error interno",
      });
      return res.render("public/auth-login/loginAuth", {
        errores: ["Error interno al iniciar sesión."],
        oldData: { email },
      });
    }
  },

  // === NUEVO ===

  // Mostrar formulario de registro
  mostrarRegistro: (req, res) => {
    res.render("public/registro", {
      errores: [],
      oldData: {},
    });
  },

  // Procesar registro de nuevo usuario
  registroUsuario: async (req, res) => {
    const { nombre, ci, email, contrasena, repetirContrasena } = req.body;
    const errores = [];
    const oldData = { nombre, ci, email };

    // Validaciones básicas
    if (!nombre || !ci || !email || !contrasena || !repetirContrasena) {
      errores.push("Todos los campos son obligatorios.");
    }
    if (!ci) {
      errores.push("El campo Cédula de Identidad es obligatorio.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.push("El correo electrónico no es válido.");
    }
    if (contrasena !== repetirContrasena) {
      errores.push("Las contraseñas no coinciden.");
    }
    if (contrasena.length < 6) {
      errores.push("La contraseña debe tener al menos 6 caracteres.");
    }

    try {
      // ¿Existe un usuario con ese email?
      const usuarioExistente = await usuariosModel.buscarPorEmail(email);
      if (usuarioExistente.length > 0) {
        errores.push("Ya existe una cuenta registrada con ese correo.");
      }

      if (errores.length > 0) {
        return res.render("public/registro", { errores, oldData });
      }

      // Hashear contraseña
      const hash = await bcrypt.hash(contrasena, 10);

      // Crear usuario en la base de datos
      await usuariosModel.crearUsuario({
        nombre,
        ci,
        email_usuario: email,
        contrasena: hash,
      });

      // Por defecto, lo registramos como alumno (esto depende de tu lógica)
      await tipousuariosModel.asignarTipoUsuario(email, "E"); // "E" para estudiante

      // Auto-login tras registro (opcional)
      req.session.usuario = {
        email,
        nombre,
        tipo: "E",
      };

      return res.redirect("/auth/home");
    } catch (error) {
      console.error("Error en registro:", error);
      errores.push("Error interno al registrar usuario.");
      return res.render("public/registro", { errores, oldData });
    }
  },
};

module.exports = loginController;
