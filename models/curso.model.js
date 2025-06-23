const { dbGetAll, dbRun, dbGetOne } = require("../db/db.handler");

const cursosModel = {
  insertar: async ({ nombre, id_categoria, precio, estrellas }) => {
    const query = `
      INSERT INTO Cursos (nombre, id_categoria, precio, estrellas)
      VALUES (?, ?, ?, ?)
    `;
    await dbRun(query, [nombre, id_categoria, precio, estrellas]);
  },

  buscar: async (nombre, options = { incluirNoPublicados: false }) => {
    let query = `SELECT * FROM Cursos WHERE nombre LIKE ?`;
    const params = [`%${nombre}%`];

    if (!options.incluirNoPublicados) {
      query += ` AND publicado = 'S'`;
    }

    return dbGetAll(query, params);
  },

  listarTodos: async () => {
    const query = `SELECT * FROM Cursos`;
    return await dbGetAll(query);
  },

  obtenerCursos: async () => {
    const query = `SELECT id_curso, nombre FROM Cursos`;
    return await dbGetAll(query);
  },

  obtenerCursosComoAlumno: async (email) => {
    const query = `
      SELECT c.*
      FROM Cursos c
      INNER JOIN Inscripciones i ON c.id_curso = i.id_curso
      WHERE i.email_usuario = ?
    `;
    return await dbGetAll(query, [email]);
  },

  obtenerCursosDeAlumno: async (email) => {
    return await cursosModel.obtenerCursosComoAlumno(email);
  },

  obtenerCursosDeProfesor: async (email) => {
    const query = `
      SELECT c.*
      FROM Cursos c
      INNER JOIN Asignaciones a ON c.id_curso = a.id_curso
      WHERE a.email_usuario = ?
    `;
    return await dbGetAll(query, [email]);
  },

  obtenerCursosDelUsuario: async (email) => {
    const cursosAlumno = await dbGetAll(
      `
      SELECT c.*, 'Alumno' AS rol
      FROM Cursos c
      INNER JOIN Inscripciones i ON c.id_curso = i.id_curso
      WHERE i.email_usuario = ?
    `,
      [email]
    );

    const cursosProfesor = await dbGetAll(
      `
      SELECT c.*, 'Profesor' AS rol
      FROM Cursos c
      INNER JOIN Asignaciones a ON c.id_curso = a.id_curso
      WHERE a.email_usuario = ?
    `,
      [email]
    );

    const mapa = new Map();

    [...cursosAlumno, ...cursosProfesor].forEach((curso) => {
      if (mapa.has(curso.id_curso)) {
        mapa.get(curso.id_curso).rol = "Ambos";
      } else {
        mapa.set(curso.id_curso, curso);
      }
    });

    return Array.from(mapa.values());
  },

  buscarPorId: async (idCurso) => {
    const query = `
      SELECT c.*, a.email_usuario AS email_profesor
      FROM Cursos c
      LEFT JOIN Asignaciones a ON c.id_curso = a.id_curso
      WHERE c.id_curso = ?
    `;
    return dbGetOne(query, [idCurso]);
  },

  publicar: async (idCurso) => {
    const query = `UPDATE Cursos SET publicado = 'S' WHERE id_curso = ?`;
    return dbRun(query, [idCurso]);
  },

  listarPublicados: async () => {
    return await dbGetAll("SELECT * FROM Cursos WHERE publicado = 'S'");
  },

  obtenerCursosPopulares: async (limite = 8) => {
    const query = `
      SELECT 
        c.id_curso,
        c.nombre,
        c.precio,
        c.estrellas,
        (
          SELECT COUNT(*) 
          FROM Inscripciones i 
          WHERE i.id_curso = c.id_curso
        ) AS cantidad_inscriptos
      FROM Cursos c
      WHERE c.publicado = 'S'
      ORDER BY cantidad_inscriptos DESC
      LIMIT ?
    `;
    return await dbGetAll(query, [limite]);
  },

  contarCursosComoAlumno: async (email) => {
    const query = `
      SELECT COUNT(*) AS total
      FROM Inscripciones
      WHERE email_usuario = ?
    `;
    const resultado = await dbGetOne(query, [email]);
    return resultado.total;
  },

  contarCursosComoProfesor: async (email) => {
    const query = `
      SELECT COUNT(*) AS total
      FROM Asignaciones
      WHERE email_usuario = ?
    `;
    const resultado = await dbGetOne(query, [email]);
    return resultado.total;
  },

  obtenerUltimosTestimonios: async (limite = 10) => {
    const query = `
      SELECT 
        c.nombre AS nombre_curso,
        c.estrellas,
        c.comentario,
        u.nombre AS nombre_alumno
      FROM Cursos c
      JOIN Inscripciones i ON c.id_curso = i.id_curso
      JOIN Usuarios u ON u.email_usuario = i.email_usuario
      WHERE c.publicado = 'S' AND c.comentario IS NOT NULL AND c.estrellas IS NOT NULL
      ORDER BY c.id_curso DESC
      LIMIT ?
    `;
    return await dbGetAll(query, [limite]);
  },

  actualizarImagen: async (idCurso, nombreImagen) => {
    const query = `UPDATE Cursos SET imagen = ? WHERE id = ?`;
    await dbRun(query, [nombreImagen, idCurso]);
  },

  actualizarCurso: async (idCurso, { nombre, precio, estrellas, imagen }) => {
    let query = `
      UPDATE Cursos
      SET nombre = ?, precio = ?, estrellas = ?
    `;
    const params = [nombre, precio, estrellas];

    if (imagen) {
      query += `, imagen = ?`;
      params.push(imagen);
    }

    query += ` WHERE id_curso = ?`;
    params.push(idCurso);

    return await dbRun(query, params);
  },

  obtenerCursosPorCategoria: async (idCategoria) => {
    const query = `
      SELECT c.*, 
        COUNT(i.id_inscripcion) AS cantidad_inscriptos
      FROM Cursos c
      LEFT JOIN Inscripciones i ON c.id_curso = i.id_curso
      WHERE c.id_categoria = ? AND c.publicado = 'S'
      GROUP BY c.id_curso
    `;
    return dbGetAll(query, [idCategoria]);
  },

  // ✅ NUEVAS FUNCIONES PARA ESTADÍSTICAS
  contarTodos: async () => {
    const query = `SELECT COUNT(*) AS total FROM Cursos`;
    const result = await dbGetOne(query);
    return result.total;
  },

  contarPublicados: async () => {
    const query = `SELECT COUNT(*) AS total FROM Cursos WHERE publicado = 'S'`;
    const result = await dbGetOne(query);
    return result.total;
  },

  contarNoPublicados: async () => {
    const query = `SELECT COUNT(*) AS total FROM Cursos WHERE publicado = 'N'`;
    const result = await dbGetOne(query);
    return result.total;
  },

  crearCurso: async ({ nombre, id_categoria, precio, estrellas }) => {
    const query = `
      INSERT INTO Cursos (nombre, id_categoria, precio, estrellas, publicado)
      VALUES (?, ?, ?, ?, 'N')
    `;
    const result = await dbRun(query, [nombre, id_categoria, precio, estrellas]);
    return result.lastID; // SQLite: retorna el ID insertado
  },

  // ALIAS PARA COMPATIBILIDAD CON EL CONTROLADOR
  listar: async () => {
    return await cursosModel.listarTodos();
  },
};

module.exports = cursosModel;

