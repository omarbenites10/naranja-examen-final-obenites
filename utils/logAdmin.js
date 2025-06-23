const fs = require("fs");
const path = require("path");

const rutaLog = path.join(__dirname, "../logs/admin.log");

function agregarLogAdmin({ usuario, recurso, id }) {
  const fechaHora = new Date().toISOString();

  // Extraer email y nombre según estructura del objeto usuario
  let nombreUsuario = "Nombre no disponible";
  let emailUsuario = "Email no disponible";

  if (usuario && typeof usuario === "object") {
    // Intentar extraer email y nombre de las propiedades comunes
    if (usuario.email_usuario) emailUsuario = usuario.email_usuario;
    else if (usuario.email) emailUsuario = usuario.email;

    if (usuario.nombre) nombreUsuario = usuario.nombre;
    else if (usuario.name) nombreUsuario = usuario.name;
  } else if (typeof usuario === "string") {
    // Si usuario es string (email)
    emailUsuario = usuario;
  }

  const linea = `[DEBUG] ${fechaHora} - Usuario: nombre: ${nombreUsuario}, email: ${emailUsuario} - Recurso: ${recurso} - ID: ${id}\n`;

  fs.appendFile(rutaLog, linea, (err) => {
    if (err) {
      console.error("❌ Error al escribir en log admin:", err);
    } else {
      console.log("✅ Log admin escrito correctamente");
    }
  });
}

module.exports = agregarLogAdmin;
