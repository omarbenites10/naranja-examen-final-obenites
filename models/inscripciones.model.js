const { dbGetAll, dbRun, dbGetOne } = require("../db/db.handler");

const inscripcionesModel = {
  // Verificar si un usuario está inscripto
  verificarInscripcion: async (idCurso, email) => {
    const query = "SELECT * FROM Inscripciones WHERE id_curso = ? AND email_usuario = ?";
    const resultado = await dbGetOne(query, [idCurso, email]);
    return !!resultado;
  },

  existeInscripcion: async (email_usuario) => {
    const query = `
      SELECT 1 FROM Inscripciones
      WHERE email_usuario = ?
      LIMIT 1
    `;
    const resultado = await dbGetAll(query, [email_usuario]);
    return resultado.length > 0;
  },

  // Verificar si un usuario es alumno del curso
  esAlumno: async (idCurso, email) => {
    const query = `SELECT * FROM Inscripciones WHERE id_curso = ? AND email_usuario = ?`;
    const resultado = await dbGetOne(query, [idCurso, email]);
    return !!resultado;
  },

  // Inscribir a un alumno
  inscribirAlumno: async (idCurso, email) => {
    const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const query = `
      INSERT INTO Inscripciones (id_curso, email_usuario, fecha_inscripcion)
      VALUES (?, ?, ?)
    `;
    return dbRun(query, [idCurso, email, fecha]);
  },

  // Listar todas las inscripciones con datos de alumno y curso
  listarInscripcionesConDatos: async () => {
    const query = `
      SELECT 
        i.id_inscripcion,
        u.nombre AS nombre_alumno,
        u.email_usuario,
        c.id_curso,
        c.nombre AS nombre_curso,
        i.fecha_inscripcion
      FROM Inscripciones i
      JOIN Usuarios u ON u.email_usuario = i.email_usuario
      JOIN Cursos c ON c.id_curso = i.id_curso
      ORDER BY i.fecha_inscripcion DESC
    `;
    return dbGetAll(query);
  },

  // Eliminar inscripción
  eliminarInscripcion: async (idInscripcion) => {
    const query = `DELETE FROM Inscripciones WHERE id_inscripcion = ?`;
    return dbRun(query, [idInscripcion]);
  },

  // Obtener inscripciones de un usuario
  obtenerInscripcionesDeUsuario: async (email) => {
    const query = `
      SELECT i.*, c.nombre AS nombre_curso
      FROM Inscripciones i
      JOIN Cursos c ON c.id_curso = i.id_curso
      WHERE i.email_usuario = ?
      ORDER BY i.fecha_inscripcion DESC
    `;
    return await dbGetAll(query, [email]);
  },

  // ✅ Contar inscripciones totales
  contarTodas: async () => {
    const query = `SELECT COUNT(*) AS total FROM Inscripciones`;
    const resultado = await dbGetOne(query);
    return resultado.total;
  },

  // ✅ NUEVA: Contar usuarios únicos inscriptos
  contarUsuariosUnicosInscriptos: async () => {
    const query = `SELECT COUNT(DISTINCT email_usuario) AS total FROM Inscripciones`;
    const resultado = await dbGetOne(query);
    return resultado.total;
  },

  // ✅ OPCIONAL: Contar inscripciones por curso específico
  contarPorCurso: async (idCurso) => {
    const query = `SELECT COUNT(*) AS total FROM Inscripciones WHERE id_curso = ?`;
    const resultado = await dbGetOne(query, [idCurso]);
    return resultado.total;
  }
};

module.exports = inscripcionesModel;
