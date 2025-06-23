const { dbGetAll, dbRun, dbGetOne } = require("../db/db.handler");
const bcrypt = require("bcryptjs");

const usuariosModel = {
  listarTodos: async () => {
    const query = `
      SELECT u.nombre, u.email_usuario
      FROM Usuarios u
      GROUP BY u.email_usuario
    `;
    return await dbGetAll(query);
  },

  obtenerTodos: async () => {
    const query = `
      SELECT 
        u.nombre, 
        u.email_usuario,
        u.activo,
        (SELECT COUNT(*) FROM Inscripciones i WHERE i.email_usuario = u.email_usuario) AS cursosAlumno,
        (SELECT COUNT(*) FROM Asignaciones a WHERE a.email_usuario = u.email_usuario) AS cursosProfesor
      FROM Usuarios u
    `;
    return await dbGetAll(query);
  },

  listar: async () => {
    return await dbGetAll("SELECT * FROM Usuarios");
  },

  validarVacio: async () => {
    return await dbGetAll("SELECT * FROM Usuarios");
  },

  buscarPorEmail: async (email) => {
    const query = `
      SELECT u.*, t.nom_tipo_usuario
      FROM Usuarios u
      JOIN Tipo_usuario t ON u.email_usuario = t.email_usuario
      WHERE u.email_usuario = ?
    `;
    return await dbGetAll(query, [email]);
  },

  buscarPorEmailYContraseña: async (email, contrasena) => {
    const query = "SELECT * FROM Usuarios WHERE email_usuario = ?";
    const resultado = await dbGetAll(query, [email]);

    console.log("🔎 Resultado crudo:", resultado);

    if (resultado.length === 0) return null;

    const usuario = resultado[0];
    const match = await bcrypt.compare(contrasena, usuario.contrasena);

    console.log("🧪 bcrypt match:", match);

    return match ? usuario : null;
  },

  buscarPorEmailUsuario: async (email) => {
    const query = `
      SELECT u.*
      FROM Usuarios u
      WHERE u.email_usuario = ?
    `;
    return await dbGetAll(query, [email]);
  },

  buscarPorEmailSimple: async (email) => {
    const query = `
      SELECT u.*, t.nom_tipo_usuario AS rol
      FROM Usuarios u
      LEFT JOIN Tipo_usuario t ON u.email_usuario = t.email_usuario
      WHERE u.email_usuario = ?
    `;
    const resultados = await dbGetAll(query, [email]);
    return resultados.length > 0 ? resultados[0] : null;
  },

  buscarPorCI: async (ci) => {
    const query = `SELECT * FROM Usuarios WHERE ci = ?`;
    return await dbGetAll(query, [ci]);
  },

  listarProfesores: async () => {
    const query = `
    SELECT DISTINCT u.nombre, u.email_usuario, u.ci, u.imagen
    FROM Usuarios u
    JOIN Asignaciones a ON u.email_usuario = a.email_usuario
  `;
    return await dbGetAll(query);
  },

  esAdmin: async (email) => {
    const query = `
      SELECT 1 FROM Tipo_usuario
      WHERE email_usuario = ? AND nom_tipo_usuario = 'A'
      LIMIT 1
    `;
    const result = await dbGetAll(query, [email]);
    return result.length > 0;
  },

  listarAlumnos: async () => {
    const query = `
      SELECT DISTINCT u.nombre, u.email_usuario, u.ci
      FROM Usuarios u
      JOIN Inscripciones i ON u.email_usuario = i.email_usuario
    `;
    return await dbGetAll(query);
  },

  crearUsuario: async ({ nombre, email_usuario, contrasena, ci }) => {
    const queryUsuario = `
      INSERT INTO Usuarios (nombre, email_usuario, contrasena, ci)
      VALUES (?, ?, ?, ?)
    `;
    const resultado = await dbRun(queryUsuario, [
      nombre,
      email_usuario,
      contrasena,
      ci,
    ]);
    return resultado;
  },

  asignarRoles: async (email_usuario, roles) => {
    const inserts = roles.map((rol) => {
      let tipo = "";
      if (rol.toLowerCase() === "alumno") tipo = "E";
      else if (rol.toLowerCase() === "profesor") tipo = "P";
      else if (rol.toLowerCase() === "admin") tipo = "A";

      return dbRun(
        `INSERT INTO Tipo_usuario (email_usuario, nom_tipo_usuario) VALUES (?, ?)`,
        [email_usuario, tipo]
      );
    });

    await Promise.all(inserts);
  },

  actualizarUsuario: async (
    emailAnterior,
    { nombre, email_usuario, rol, ci }
  ) => {
    const queryUsuarios = `
      UPDATE Usuarios
      SET nombre = ?, email_usuario = ?, ci = ?
      WHERE email_usuario = ?
    `;
    await dbRun(queryUsuarios, [nombre, email_usuario, ci, emailAnterior]);

    const queryTipo = `
      UPDATE Tipo_usuario
      SET email_usuario = ?, nom_tipo_usuario = ?
      WHERE email_usuario = ?
    `;
    const rolDB = rol === "admin" ? "A" : rol === "profesor" ? "P" : "E";
    await dbRun(queryTipo, [email_usuario, rolDB, emailAnterior]);
  },

  existeUsuarioPorEmail: async (email) => {
    const query = `SELECT 1 FROM Usuarios WHERE email_usuario = ? LIMIT 1`;
    const result = await dbGetAll(query, [email]);
    return result.length > 0;
  },

  actualizarDatosBasicos: async (email, nombre, apellido, telefono) => {
    const query = `
      UPDATE Usuarios
      SET nombre = ?, apellido = ?, telefono = ?
      WHERE email_usuario = ?
    `;
    return dbRun(query, [nombre, apellido, telefono, email]);
  },

  actualizarContrasena: async (email, nuevaContrasena) => {
    const query = "UPDATE Usuarios SET contrasena = ? WHERE email_usuario = ?";
    await dbRun(query, [nuevaContrasena, email]);
  },

  darDeBajaUsuario: async (email_usuario) => {
    const query = `
      UPDATE Usuarios
      SET activo = 0
      WHERE email_usuario = ?
    `;
    return await dbRun(query, [email_usuario]);
  },

  // ✅ NUEVAS FUNCIONES PARA ESTADÍSTICAS
  contarTodos: async () => {
    const query = `SELECT COUNT(*) AS total FROM Usuarios`;
    const resultado = await dbGetOne(query);
    return resultado.total;
  },

  contarPorTipo: async (tipo) => {
    const query = `
      SELECT COUNT(*) AS total
      FROM Tipo_usuario
      WHERE nom_tipo_usuario = ?
    `;
    const resultado = await dbGetOne(query, [tipo]);
    return resultado.total;
  },
};

module.exports = usuariosModel;
