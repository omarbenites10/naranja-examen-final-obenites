module.exports = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== "P") {
      return res.render("public/mensaje", {
        titulo: "Acceso restringido",
        mensaje: "Debes iniciar sesión como profesor.",
        link: "/auth/login",
        textoBoton: "Iniciar sesión"
      });
    }
    next();
  };