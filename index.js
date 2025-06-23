  // importar express
  const express = require("express");
  // importar path
  const path = require("path");
  // importar rutas

  require("dotenv").config();
  const authRouter = require("./routes/auth.routes");
  const adminRouter = require("./routes/admin.routes");
  const publicRouter = require("./routes/public.routes");
  const apiRoutes = require("./routes/api.routes");

  // importar módulos de sesión
  const session = require("express-session");
  const SQLiteStore = require("connect-sqlite3")(session);

  // crear app express
  const app = express();

  app.use(express.json());
  // parsear datos de formularios
  app.use(express.urlencoded({ extended: true }));

  // configurar sesiones en base de datos SQLite
  app.use(
    session({
      name: "is3-session-name",
      store: new SQLiteStore({
        db: "database.sqlite",
        dir: "./db",
      }),
      secret: "clave-aleatoria-y-secreta",
      resave: false,
      httpOnly: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hora
      },
    })
  );

  // middleware global
  app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.projectName = process.env.NAME_PROJECT || "Mi Proyecto";
    next();
  });

  // configurar EJS como motor de plantillas
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "/views"));

// servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "assets"))); // esto sirve desde /
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // esto sirve desde /assets
app.use(
  "/assets/categorias",
  express.static(path.join(__dirname, "assets/categorias"))
);


  // usar las rutas
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/public", publicRouter);

  // redirigir raíz al home público
  app.get("/", (req, res) => {
    res.redirect("/public/home");
  });

  // redirigir raíz al home público
  app.get("/home", (req, res) => {
    res.redirect("/public/home");
  });

  app.use("/api", apiRoutes);

  // ruta 404
  app.use((req, res) => {
    res.status(404).render("404");
  });

// puerto
const puerto = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto: " + puerto);
  });
}

module.exports = app;

