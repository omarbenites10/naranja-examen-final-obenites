module.exports = (req, res, next) => {
    const { email, contrasena } = req.body;
  
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const contrasenaValida = contrasena && contrasena.length >= 6;
  
    if (!email || !contrasena || !emailValido || !contrasenaValida) {
      return res.redirect(req.originalUrl); // vuelve al login con los datos inválidos
    }
  
    next();
  };