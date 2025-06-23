module.exports = (req, res, next) => {
    if (!req.session.usuario) {
      return res.render("public/mensaje", {
        titulo: "Iniciá sesión",
        mensaje: "Para ver tus cursos, primero debés iniciar sesión.",
        link: "/auth/login",
        textoBoton: "Iniciar sesión"
      });
    }
  
    if (req.session.usuario.tipo !== "E") {
      return res.render("public/mensaje", {
        titulo: "Acceso restringido",
        mensaje: "Esta sección es solo para alumnos.",
        link: "/auth/home",
        textoBoton: "Volver"
      });
    }
  
    next(); // usuario válido como alumno
  };