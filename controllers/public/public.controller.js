const cursosModel = require("../../models/curso.model");
const usuariosModel = require("../../models/usuario.model");
const categoriaModel = require("../../models/categoria.model");

const publicController = {
  home: async (req, res) => {
    try {
      const cursosPopulares = await cursosModel.obtenerCursosPopulares();
      const profesores = await usuariosModel.listarProfesores();
      const alumnos = await usuariosModel.listarAlumnos();
      const testimonios = await cursosModel.obtenerUltimosTestimonios();
      const categoriasPopulares =
        await categoriaModel.top4CategoriasConImagen();
      const usuario = req.session.usuario || null;

      let esAlumno = false;
      let esProfesor = false;
      let esAdmin = false;

      if (usuario && usuario.email_usuario) {
        const email = usuario.email_usuario;

        const inscripciones = await cursosModel.obtenerCursosDelUsuario(email);
        esAlumno = inscripciones.length > 0;

        const asignaciones =
          typeof cursosModel.obtenerCursosDeProfesor === "function"
            ? await cursosModel.obtenerCursosDeProfesor(email)
            : [];

        esProfesor = asignaciones && asignaciones.length > 0;
        esAdmin = await usuariosModel.esAdmin(email);
      }

      res.render("public/home", {
        usuario,
        cursosPopulares,
        profesores,
        alumnos,
        categoriasPopulares,
        esAlumno,
        esProfesor,
        esAdmin,
        testimonios,
      });
    } catch (error) {
      console.error("Error al renderizar la página principal:", error);
      res.status(500).send("Error interno del servidor.");
    }
  },

  misCursos: async (req, res) => {
    const usuario = req.session.usuario;

    if (!usuario || (!usuario.email && !usuario.email_usuario)) {
      return res.redirect("/auth-login/try");
    }

    try {
      const email = usuario.email_usuario || usuario.email;
      const cursos = await cursosModel.obtenerCursosDelUsuario(email);

      res.render("public/mis-cursos", {
        usuario,
        cursos,
        mensaje:
          cursos.length === 0
            ? "Actualmente no estás inscripto a ningún curso."
            : null,
      });
    } catch (error) {
      console.error("Error al mostrar mis cursos:", error);
      res.status(500).send("Error interno.");
    }
  },

  about: (req, res) => {
    res.render("public/about", { usuario: req.session.usuario || null });
  },

  verProfesores: async (req, res) => {
    try {
      const profesores = await usuariosModel.listarProfesores();
      res.render("public/profesores", {
        profesores,
        usuario: req.session.usuario || null,
      });
    } catch (error) {
      console.error("Error al obtener profesores:", error);
      res.status(500).send("Error al obtener los profesores");
    }
  },

  verCursosPorCategoria: async (req, res) => {
    const { id } = req.params;

    try {
      const categoria = await categoriaModel.obtenerPorId(id);
      if (!categoria) {
        return res
          .status(404)
          .render("404", { usuario: req.session.usuario || null });
      }

      const cursos = await cursosModel.obtenerCursosPorCategoria(id);

      res.render("public/cursos-categoria", {
        categoria,
        cursos,
        usuario: req.session.usuario || null,
      });
    } catch (error) {
      console.error("Error al cargar cursos por categoría:", error);
      res.status(500).send("Error del servidor.");
    }
  },

  contact: (req, res) => {
    res.render("public/contact", { usuario: req.session.usuario || null });
  },

  privacy: (req, res) => {
    res.render("public/privacy", { usuario: req.session.usuario || null });
  },

  terms: (req, res) => {
    res.render("public/termcondic", { usuario: req.session.usuario || null });
  },

  faq: (req, res) => {
    res.render("public/preguntas", { usuario: req.session.usuario || null });
  },

  cookies: (req, res) => {
    res.render("public/cookies", { usuario: req.session.usuario || null });
  },

  help: (req, res) => {
    res.render("public/help", { usuario: req.session.usuario || null });
  },
};

module.exports = publicController;
