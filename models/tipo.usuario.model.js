const { dbGetAll, dbRun } = require("../db/db.handler");

const tipousuariosModel = {
   listar: async () => {     
      return await dbGetAll("select * from tipo_usuario")
   },
   
   validarVacio: async () => {  
      return await dbGetAll("select * from tipo_usuario")
   },

   buscarTipoPorEmail: async (email) => {
      const query = "SELECT * FROM tipo_usuario WHERE email_usuario = ?";
      return await dbGetAll(query, [email]);
   },

   esSuperAdmin: async (email) => {
      const query = "SELECT nom_tipo_usuario FROM Tipo_usuario WHERE email_usuario = ?";
      const resultado = await dbGetAll(query, [email]);

      if (resultado.length > 0 && resultado[0].nom_tipo_usuario === 'A') {
         return true;
      }
      return false;
   },

   // === NUEVO: Asignar tipo de usuario ===
   asignarTipoUsuario: async (email_usuario, tipo) => {
      const query = `
         INSERT INTO Tipo_usuario (email_usuario, nom_tipo_usuario)
         VALUES (?, ?)
      `;
      return await dbRun(query, [email_usuario, tipo]);
   },
};

module.exports = tipousuariosModel;
