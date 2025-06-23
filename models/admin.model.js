const { dbGetAll, dbRun } = require("../db/db.handler");

const adminModel = {
  obtenerProfesores: async () => {
    const query = `
      SELECT u.email_usuario, u.nombre
      FROM Usuarios u
      JOIN Tipo_usuario t ON u.email_usuario = t.email_usuario
      WHERE t.nom_tipo_usuario = 'P'
    `;
    return await dbGetAll(query);
  }
};

module.exports = adminModel;