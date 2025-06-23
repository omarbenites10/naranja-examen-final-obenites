const Joi = require("joi");
const cursosModel = require("../models/curso.model");
const usuariosModel = require("../models/usuario.model");
const inscripcionesModel = require("../models/inscripciones.model");

const inscripcionSchema = Joi.object({
  id_curso: Joi.number().integer().required(),
  email_usuario: Joi.string().email().required()
});

const validarInscripcion = async (req, res, next) => {
  const { id_curso, email_usuario } = req.body;

  const cursos = await cursosModel.listarPublicados();
  const alumnos = await usuariosModel.listarAlumnos();

  // Validar estructura con Joi
  const { error } = inscripcionSchema.validate({ id_curso, email_usuario });
  if (error) {
    return res.render("admin/nueva-inscripcion", {
      cursos,
      alumnos,
      error: "Datos inválidos: " + error.details[0].message
    });
  }

  try {
    // Validar que el curso esté publicado
    const curso = await cursosModel.buscarPorId(id_curso);
    if (!curso || curso.publicado !== 'S') {
      return res.render("admin/nueva-inscripcion", {
        cursos,
        alumnos,
        error: "El curso no está publicado o no existe"
      });
    }

    // Verificar si el alumno ya está inscripto
    const yaInscripto = await inscripcionesModel.verificarInscripcion(id_curso, email_usuario);
    if (yaInscripto) {
      return res.render("admin/nueva-inscripcion", {
        cursos,
        alumnos,
        error: "El alumno ya está inscripto en este curso"
      });
    }

    next(); // ✅ Todo bien, continuar con la inscripción
  } catch (err) {
    console.error("Error en validación de inscripción:", err);
    res.status(500).send("Error interno en validación");
  }
};

module.exports = {
  validarInscripcion,
  inscripcionSchema // 👈 esto faltaba
};
