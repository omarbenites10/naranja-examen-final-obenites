const inscripcionesModel = require("../models/inscripciones.model");
const cursosModel = require("../models/curso.model");
const usuariosModel = require("../models/usuario.model");

module.exports = {
  listar: async (req, res) => {
    try {
      const inscripciones = await inscripcionesModel.listarInscripcionesConDatos();
      res.render("admin/inscripciones", { inscripciones });
    } catch (error) {
      console.error("Error al listar inscripciones:", error);
      res.status(500).send("Error al cargar las inscripciones");
    }
  },

  eliminar: async (req, res) => {

    try {
      const id = req.params.id;
      await inscripcionesModel.eliminarInscripcion(id);
      res.redirect("/admin/inscripciones");
    } catch (error) {
      console.error("Error al eliminar inscripción:", error);
      res.status(500).send("Error al eliminar inscripción");
    }
  },

  formulario: async (req, res) => {
    try {
      const cursos = await cursosModel.listarPublicados();
      const alumnos = await usuariosModel.listarTodos();
      res.render("admin/nueva-inscripcion", { cursos, alumnos, error: null });
    } catch (error) {
      console.error("Error al cargar formulario de inscripción:", error);
      res.status(500).send("Error al cargar el formulario");
    }
  },

  inscribir: async (req, res) => {
    const { id_curso, email_usuario } = req.body;

    try {
      await inscripcionesModel.inscribirAlumno(id_curso, email_usuario);
      res.redirect("/admin/inscripciones");
    } catch (error) {
      console.error("Error al inscribir alumno:", error);
      res.status(500).send("Error al procesar la inscripción");
    }
  }
};