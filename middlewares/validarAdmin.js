function validarAdmin(req, res, next) {
  const usuario = req.session.usuario;

  if (!usuario) {
      return res.status(401).send("No estás autenticado");
  }

  if (usuario.tipo !== "A") {
      return res.status(403).send("Acceso denegado: No sos administrador");
  }

  next();
}

module.exports = validarAdmin;
 