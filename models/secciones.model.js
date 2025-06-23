const { dbGetAll, dbRun } = require("../db/db.handler");
  
const seccionesModel = {
  // Buscar secciones de un curso
  buscarSecciones: async (idCurso) => {
    const query = "SELECT * FROM Secciones WHERE id_curso = ?";
    return dbGetAll(query, [idCurso]);
  },

// Agregar sección
agregarSeccion: async (idCurso, nombre) => {
    const query = `
      INSERT INTO Secciones (id_curso, nombre)
      VALUES (?, ?)
    `;
    return dbRun(query, [idCurso, nombre]);
  },
}

module.exports = seccionesModel;