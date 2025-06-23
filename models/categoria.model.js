const { dbGetAll, dbRun, dbGetOne } = require("../db/db.handler");
const db = require("../db/conexion");

const categoriasModel = {
  listarConCantidadCursos: async () => {
    const query = `
      SELECT cat.id_categoria, cat.nombre, cat.imagen, COUNT(c.id_curso) AS cantidad_cursos
      FROM Categorias cat
      LEFT JOIN Cursos c ON c.id_categoria = cat.id_categoria
      GROUP BY cat.id_categoria, cat.nombre, cat.imagen
      ORDER BY cat.nombre;
    `;
    return dbGetAll(query);
  },

  obtenerPorNombre: async (nombre) => {
    const sql = "SELECT * FROM categorias WHERE nombre = ?";
    const resultados = await dbGetAll(sql, [nombre]);
    return resultados[0];
  },

  crear: (nombre, imagen) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO categorias (nombre, imagen) VALUES (?, ?)";
      db.run(sql, [nombre, imagen], function (err) {
        if (err) return reject(err);
        // 👇 devolvemos correctamente el ID de la nueva fila insertada
        resolve({ lastID: this.lastID });
      });
    });
  },

  top4CategoriasConMasCursos: async () => {
    const query = `
      SELECT c.id_categoria, cat.nombre AS nombre_categoria, COUNT(*) AS cantidad
      FROM Cursos c
      JOIN Categorias cat ON c.id_categoria = cat.id_categoria
      WHERE c.publicado = 'S'
      GROUP BY c.id_categoria
      ORDER BY cantidad DESC
      LIMIT 4
    `;
    return dbGetAll(query);
  },
  top4CategoriasConImagen: async () => {
    const query = `
      SELECT id_categoria, nombre, 
        COALESCE(NULLIF(imagen, ''), 'default.jpg') AS imagen
      FROM Categorias
      ORDER BY (SELECT COUNT(*) FROM Cursos WHERE Cursos.id_categoria = Categorias.id_categoria) DESC
      LIMIT 4
    `;
    return await dbGetAll(query);
  },
  tieneCursosAsociados: async (id) => {
    const sql = "SELECT COUNT(*) as total FROM cursos WHERE id_categoria = ?";
    const [resultado] = await dbGetAll(sql, [id]);
    return resultado.total > 0;
  },

  eliminar: async (id) => {
    const tieneCursos = await categoriasModel.tieneCursosAsociados(id);
    if (tieneCursos) {
      throw new Error("La categoría tiene cursos asociados.");
    }

    const sql = "DELETE FROM categorias WHERE id_categoria = ?";
    await dbRun(sql, [id]);
  },

  obtenerPorId: async (id) => {
    const sql = "SELECT * FROM categorias WHERE id_categoria = ?";
    const resultados = await dbGetAll(sql, [id]);
    return resultados[0];
  },

  actualizar: async (id, nombre, imagen) => {
    const sql =
      "UPDATE categorias SET nombre = ?, imagen = ? WHERE id_categoria = ?";
    await dbRun(sql, [nombre, imagen, id]);
  },

  listar: async () => {
    const sql = "SELECT * FROM categorias ORDER BY nombre";
    return dbGetAll(sql);
  },
  asignarImagen: async (id, nombreImagen) => {
    const sql = "UPDATE categorias SET imagen = ? WHERE id_categoria = ?";
    await dbRun(sql, [nombreImagen, id]);
  },
};

module.exports = categoriasModel;
