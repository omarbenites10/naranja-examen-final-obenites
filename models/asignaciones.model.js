const { dbGetAll, dbRun, dbGetOne } = require("../db/db.handler");

const asignacionesModel = {
  insertarAsignacion: async (id_curso, email_usuario) => {
  const yaExiste = await dbGetOne(
    `SELECT 1 FROM Asignaciones WHERE id_curso = ? AND email_usuario = ?`,
    [id_curso, email_usuario]
  );

  if (yaExiste) {
    throw new Error("Ya existe una asignación para este curso y profesor.");
  }

  const query = `
    INSERT INTO Asignaciones (id_curso, email_usuario)
    VALUES (?, ?)
  `;
  return await dbRun(query, [id_curso, email_usuario]);
},

  // Verificar si un usuario es profesor del curso
  esProfesor: async (idCurso, email) => {
    const query = `SELECT * FROM Asignaciones WHERE id_curso = ? AND email_usuario = ?`;
    const resultado = await dbGetAll(query, [idCurso, email]);
    return resultado.length > 0;
  },

  existeAsignacion: async (email_usuario) => {
    const query = `
      SELECT 1 FROM Asignaciones
      WHERE email_usuario = ?
      LIMIT 1
    `;
    const resultado = await dbGetAll(query, [email_usuario]);
    return resultado.length > 0;
  },

  listarAsignacionesConDatos: async () => {
    const query = `
      SELECT 
        u.nombre AS nombre_profesor,
        u.email_usuario,
        c.nombre,
        c.id_curso,
        c.publicado,
        a.id_asignacion
      FROM Asignaciones a
      JOIN Usuarios u ON a.email_usuario = u.email_usuario
      JOIN Cursos c ON a.id_curso = c.id_curso
    `;
    return await dbGetAll(query);
  },

  eliminarAsignacion: async (idAsignacion) => {
    const query = 'DELETE FROM Asignaciones WHERE id_asignacion = ?';
    return await dbRun(query, [idAsignacion]);
  },

  // ✅ Nueva función para estadísticas
  contarTodas: async () => {
    const query = `SELECT COUNT(*) AS total FROM Asignaciones`;
    const resultado = await dbGetOne(query);
    return resultado.total;
  }
};

module.exports = asignacionesModel;
