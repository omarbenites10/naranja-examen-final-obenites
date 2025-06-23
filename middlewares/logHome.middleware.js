const logger = require("./logger");

function logHomeAccess(req, res, next) {
  const path = req.path;
  const isHomePage = path === "/home";

  if (isHomePage) {
    const usuario = req.session.usuario;
    const id = usuario?.id_usuario || "anon";
    const email = usuario?.email_usuario || "anónimo";
    const fullPath = req.originalUrl;

    logger.debug(`Ingreso a ${fullPath} - ID: ${id}, Email: ${email}`);
  }

  next();
}

module.exports = logHomeAccess;
