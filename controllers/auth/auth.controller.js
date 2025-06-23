const usuariosModel = require("../../models/usuario.model");
const tipousuariosModel = require("../../models/tipo.usuario.model");
const cursosModel = require("../../models/curso.model");
const bcrypt = require("bcryptjs");
const categoriaModel = require("../../models/categoria.model");

const authController = {
  home: async (req, res) => {
    try {
      const usuario = req.session.usuario || null;
      const email = usuario?.email_usuario || usuario?.email || null;
      let esAlumno = false;
      let esProfesor = false;
      let esAdmin = false;

      if (email) {
        const inscripciones = await cursosModel.obtenerCursosComoAlumno(email);
        const asignaciones = await cursosModel.obtenerCursosDeProfesor(email);
        const admin = await usuariosModel.esAdmin(email);

        esAlumno = inscripciones.length > 0;
        esProfesor = asignaciones.length > 0;
        esAdmin = admin;
      }

      const profesores = await usuariosModel.listarProfesores();
      const testimonios = await cursosModel.obtenerUltimosTestimonios();

      const categoriasPopulares =
        await categoriaModel.top4CategoriasConImagen();

      res.render("auth/home/index", {
        usuario,
        esAlumno,
        esProfesor,
        esAdmin,
        categoriasPopulares,
        testimonios,
        profesores,
      });
    } catch (error) {
      console.error("Error al cargar el home:", error);
      res.status(500).send("Error al cargar el home");
    }
  },

  redirectHome: (req, res) => {
    res.redirect("/auth/home");
  },

  login: async (req, res) => {
    const { email, contrasena } = req.body;

    try {
      const usuario = await usuariosModel.buscarPorEmailYContraseña(
        email,
        contrasena
      );
      if (!usuario || usuario.activo === 0) {
        return res.render("public/auth-login/loginAuth", {
          error: "Credenciales inválidas o cuenta inactiva.",
          usuario: null,
          errores: [],
          oldData: { email },
        });
      }

      const inscripciones = await cursosModel.obtenerCursosComoAlumno(email);
      const asignaciones = await cursosModel.obtenerCursosDeProfesor(email);

      const esAlumno = inscripciones.length > 0;
      const esProfesor = asignaciones.length > 0;

      if (!esAlumno && !esProfesor) {
        return res.render("public/auth-login/loginAuth", {
          error: "No estás registrado como alumno ni como profesor.",
          usuario: null,
          errores: [],
          oldData: { email },
        });
      }

      req.session.usuario = {
        ...usuario,
        esAlumno,
        esProfesor,
      };

      return res.redirect("/auth/home");
    } catch (error) {
      console.error("Error en login:", error);
      return res.status(500).send("Error interno del servidor.");
    }
  },

loginAdmin: async (req, res) => {
  const { email, contrasena } = req.body;
  console.log("Intento login admin con:", email);

  const usuario = await usuariosModel.buscarPorEmailYContraseña(email, contrasena);
  console.log("Resultado búsqueda usuario:", usuario);

  if (!usuario || usuario.activo === 0) {
    console.log("Credenciales inválidas o usuario inactivo");
    return res.render("public/admin-login/login", {
      error: "Credenciales inválidas o cuenta inactiva.",
    });
  }

  const esAdmin = await usuariosModel.esAdmin(email);
  if (!esAdmin) {
    console.log("Usuario no es admin");
    return res.render("public/admin-login/login", {
      error: "No estás autorizado como administrador.",
    });
  }

  req.session.usuario = {
    ...usuario,
    esAdmin: true,
  };

  console.log("Login exitoso, redirigiendo a /admin/home");
  return res.redirect("/admin/home");
},

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("No se pudo cerrar sesión");
      }
      res.redirect("/auth/login");
    });
  },

  mostrarTeam: (req, res) => {
    res.render("team", {
      usuario: req.session.usuario || null,
    });
  },

  mostrarLogin: (req, res) => {
    res.render("public/auth-login/loginAuth", {
      usuario: req.session.usuario || null,
      errores: [],
      oldData: {},
      error: null,
    });
  },

  validarMisCursos: (req, res) => {
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.render("public/mensaje", {
        titulo: "Iniciá sesión",
        mensaje: "Para ver tus cursos, primero debés iniciar sesión.",
        link: "/auth/login",
        textoBoton: "Iniciar sesión",
      });
    }

    if (usuario.esAlumno) {
      return res.redirect("/auth/mis-cursos-alumno");
    }

    if (usuario.esProfesor) {
      return res.redirect("/auth/mis-cursos-profesor");
    }

    return res.render("public/mensaje", {
      titulo: "Acceso restringido",
      mensaje: "Esta sección es solo para alumnos o profesores.",
      link: "/auth/home",
      textoBoton: "Volver",
    });
  },

  vistaMisDatos: (req, res) => {
    res.render("auth/mis-datos", {
      usuario: req.session.usuario,
      mensaje: null,
    });
  },

  guardarMisDatos: async (req, res) => {
    const { nombre, apellido, telefono } = req.body;
    const usuario = req.session.usuario;

    if (!nombre || !apellido || /\d/.test(nombre) || /\d/.test(apellido)) {
      return res.render("auth/mis-datos", {
        usuario,
        mensaje: "Nombre y apellido no deben estar vacíos ni contener números.",
      });
    }

    try {
      await usuariosModel.actualizarDatosBasicos(
        usuario.email_usuario,
        nombre,
        apellido,
        telefono
      );

      req.session.usuario.nombre = nombre;
      req.session.usuario.apellido = apellido;
      req.session.usuario.telefono = telefono;

      res.redirect("/auth/mis-datos");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      res.render("auth/mis-datos", {
        usuario,
        mensaje: "Ocurrió un error al guardar los datos.",
      });
    }
  },

  formularioCambio: (req, res) => {
    if (!req.session.usuario) return res.redirect("/auth-login/try");
    res.render("public/cambiar-contrasena", { errores: [], oldData: {} });
  },

  cambiarContrasena: async (req, res) => {
    const { contrasenaActual, nuevaContrasena, repetirContrasena } = req.body;
    const email =
      req.session.usuario.email_usuario || req.session.usuario.email;

    const errores = [];

    if (!contrasenaActual || !nuevaContrasena || !repetirContrasena) {
      errores.push("Todos los campos son obligatorios.");
    }

    if (nuevaContrasena.length < 6) {
      errores.push("La nueva contraseña debe tener al menos 6 caracteres.");
    }

    if (nuevaContrasena !== repetirContrasena) {
      errores.push("Las contraseñas nuevas no coinciden.");
    }

    try {
      const resultado = await usuariosModel.buscarPorEmailUsuario(email);

      if (resultado.length === 0) {
        errores.push("Usuario no encontrado.");
        return res.render("public/cambiar-contrasena", {
          errores,
          oldData: {},
        });
      }

      const usuario = resultado[0];

      const match = await bcrypt.compare(contrasenaActual, usuario.contrasena);
      if (!match) {
        errores.push("La contraseña actual es incorrecta.");
        return res.render("public/cambiar-contrasena", {
          errores,
          oldData: {},
        });
      }

      if (errores.length > 0) {
        return res.render("public/cambiar-contrasena", {
          errores,
          oldData: {},
        });
      }

      const nuevaHasheada = await bcrypt.hash(nuevaContrasena, 10);
      await usuariosModel.actualizarContrasena(email, nuevaHasheada);

      return res.redirect(
        req.session.usuario.tipo === "A" ? "/admin/home" : "/auth/home"
      );
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      return res.render("public/cambiar-contrasena", {
        errores: ["Error al procesar la solicitud."],
        oldData: {},
      });
    }
  },

  formularioBajaCuenta: (req, res) => {
    res.render("auth/baja-cuenta", {
      usuario: req.session.usuario,
    });
  },

  procesarBajaCuenta: async (req, res) => {
    const usuario = req.session.usuario;

    try {
      const esAdmin = await usuariosModel.esAdmin(usuario.email_usuario);
      if (esAdmin) {
        return res.render("auth/baja-cuenta", {
          usuario,
          error: "El administrador no puede darse de baja.",
        });
      }

      await usuariosModel.darDeBajaUsuario(usuario.email_usuario);

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send("Error al cerrar sesión tras la baja.");
        }
        return res.redirect("/public/home");
      });
    } catch (error) {
      console.error("Error al dar de baja:", error);
      res.status(500).send("Error al procesar la baja.");
    }
  },
  loginAdminTest: async (req, res) => {
    const { email, contrasena } = req.body;

    console.log("🔍 Body recibido:", req.body);

    try {
      const resultadoEmail = await usuariosModel.buscarPorEmail(email);
      if (resultadoEmail.length === 0) {
        return res.status(401).json({ error: "Correo no registrado" });
      }

      const usuario = resultadoEmail[0];
      const passwordValida = await bcrypt.compare(
        contrasena,
        usuario.contrasena
      );
      if (!passwordValida) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      const resultadoTipo = await tipousuariosModel.buscarTipoPorEmail(email);
      const tipo = resultadoTipo[0]?.nom_tipo_usuario;

      if (tipo !== "A") {
        return res.status(403).json({ error: "No es administrador" });
      }

      req.session.usuario = {
        email: usuario.email_usuario,
        nombre: usuario.nombre,
        tipo,
      };

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Login admin test error:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  },
};

module.exports = authController;
