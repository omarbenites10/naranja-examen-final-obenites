const db = require('./conexion'); // Ajustá si tu ruta es distinta
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function insertarUsuarios() {
  const usuarios = [
    ['alumno1@correo.com', 12345678, 'Luis Martínez', '123456'],
    ['alumno2@correo.com', 23456789, 'Ana Torres', '123456'],
    ['profesor1@correo.com', 34567890, 'Carlos Gómez', '123456'],
    ['admin1@correo.com', 45678901, 'María Ruiz', '123456']
  ];

  db.serialize(async () => {
    for (const [email, ci, nombre, password] of usuarios) {
      const hashedPass = await bcrypt.hash(password, saltRounds);
      db.run(
        `INSERT INTO Usuarios (email_usuario, ci, nombre, contrasena) VALUES (?, ?, ?, ?)`,
        [email, ci, nombre, hashedPass],
        function (err) {
          if (err) {
            console.error("Error insertando usuario:", err.message);
          } else {
            console.log(`✅ Insertado: ${email}`);
          }
        }
      );
    }
  });
}

insertarUsuarios().catch(console.error);