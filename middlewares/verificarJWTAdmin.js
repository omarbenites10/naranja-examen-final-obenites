const jwt = require("jsonwebtoken");
const SECRET_KEY = "CLAVE_SUPER_SECRETA"; // o process.env.JWT_SECRET

function verificarJWTAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, acceso denegado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.rol !== "admin") {
      return res.status(403).json({ error: "No sos administrador" });
    }

    req.usuario = decoded; // guardamos datos si se necesitan
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = verificarJWTAdmin;