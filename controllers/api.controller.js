const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const usuariosModel = require("../models/usuario.model");
const SECRET_KEY = "CLAVE_SUPER_SECRETA";

const apiController = {
  loginAdmin: async (req, res) => {
    const { email, password } = req.body;

    console.log("➡️ Recibido:", email, password);

    const usuario = await usuariosModel.buscarPorEmailYContraseña(
      email,
      password
    );
    console.log("🧍 Usuario encontrado:", usuario);

    if (!usuario) {
      console.log("❌ No se encontró usuario o contraseña inválida");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const esAdmin = await usuariosModel.esAdmin(email);
    console.log("🛡️ ¿Es admin?:", esAdmin);

    if (!esAdmin) {
      return res.status(403).json({ error: "No sos administrador" });
    }

    const token = jwt.sign({ rol: "admin", email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("✅ Token generado:", token);

    return res.json({ token });
  },

  cantidadCursos: async (req, res) => {
    const publicados = await cursosModel.contarPublicados();
    const noPublicados = await cursosModel.contarNoPublicados();
    res.json({ publicados, noPublicados });
  },

  crearCurso: async (req, res) => {
    const id = await cursosModel.crearCurso(req.body);
    res.json({ id });
  },

  publicarCurso: async (req, res) => {
    const { id } = req.params;
    await cursosModel.publicar(id);
    res.json({ publicado: true });
  },
};

module.exports = apiController;
