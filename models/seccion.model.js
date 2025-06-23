const db = require("../db/conexion");
const { dbGetOne } = require("../db/db.handler");

const seccionesModel = {
    // Agregar sección
    agregarSeccion: async (idCurso, nombre) => {
        const query = `
          INSERT INTO Secciones (id_curso, nombre)
          VALUES (?, ?)
        `;
        return dbRun(query, [idCurso, nombre]);
      },
};

module.exports = seccionesModel;