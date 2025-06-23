const { dbGetAll, dbRun } = require("../db/db.handler");


const valoracionesModel = {
  buscarPorCurso: async (id_curso) => {
    const query = `
      SELECT estrellas, comentario, email_usuario
      FROM Valoraciones
      WHERE id_curso = ?
    `;
    return await dbGetAll(query, [id_curso]);
  },

  guardarOActualizar: async ({ email_usuario, id_curso, estrellas, comentario }) => {
    const query = `
      INSERT INTO Valoraciones (email_usuario, id_curso, estrellas, comentario)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email_usuario, id_curso)
      DO UPDATE SET
        estrellas = excluded.estrellas,
        comentario = excluded.comentario
    `;
    return await dbRun(query, [email_usuario, id_curso, estrellas, comentario]);
  }
};


module.exports = valoracionesModel;
