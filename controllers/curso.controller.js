const cursosModel = require("../models/curso.model");
const inscripcionesModel = require("../models/inscripciones.model");
const seccionesModel = require("../models/secciones.model");
const asignacionesModel = require("../models/asignaciones.model");
const usuariosModel = require("../models/usuario.model");
const categoriasModel = require("../models/categoria.model");
const valoracionesModel = require("../models/valoracionesModel");



const { inscripcionSchema } = require("../middlewares/validarInscripcion.middleware");
const { schemaCurso } = require("../middlewares/validarCurso.middleware");

const cursoController = {
  verMisCursos: async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) return res.redirect("/auth-login/try");

    const email = usuario.email_usuario;

    try {
      const cursos = await cursosModel.obtenerCursosComoAlumno(email);
      return res.render("public/mis-cursos", {
        cursos,
        mensaje: cursos.length === 0 ? "Actualmente no estás inscripto a ningún curso." : null,
        usuario
      });
    } catch (error) {
      console.error("Error al obtener cursos del alumno:", error);
      res.status(500).send("Error al cargar tus cursos.");
    }
  },

  publicHome: async (req, res) => {
    try {
      const cursosPopulares = await cursosModel.obtenerCursosPopulares();
      const profesores = await usuariosModel.listarProfesores();
      const alumnos = await usuariosModel.listarAlumnos();

      res.render("public/home", {
        cursosPopulares,
        profesores,
        alumnos,
        usuario: req.session.usuario || null
      });
    } catch (error) {
      console.error("Error al cargar home:", error);
      res.status(500).render("404", {
        title: "Error",
        message: "No se pudo cargar la página de inicio.",
        usuario: req.session.usuario || null
      });
    }
  },

  formulario: async (req, res) => {
    const categorias = await categoriasModel.listar();
    res.render("admin/cursos/nuevo", { categorias, errores: [] });
  },

  guardar: async (req, res) => {
    const { nombre, id_categoria, precio, estrellas } = req.body;

    try {
      // Insertamos curso primero
      const resultado = await cursosModel.insertar({
        nombre,
        id_categoria: parseInt(id_categoria),
        precio: parseFloat(precio),
        estrellas: parseInt(estrellas)
      });

      const idCurso = resultado.id; // ← esto depende de tu `insertar`, asegurate que lo devuelva

      // Si vino archivo y se insertó bien
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const nuevaRuta = path.join(__dirname, "../public/assets/cursos", `${idCurso}${ext}`);

        // Renombrar archivo temp a idCurso.ext
        const fs = require("fs");
        fs.renameSync(req.file.path, nuevaRuta);
      }

      res.redirect("/admin/home");
    } catch (error) {
      console.error("Error al insertar curso:", error);
      res.status(500).send("Error al insertar curso: " + error.message);
    }
  },

  buscarCurso: async (req, res) => {
    const nombre = req.query.nombre;
    const usuario = req.session.usuario || null;
    const esProfesor = usuario?.esProfesor || false;

    if (!nombre || nombre.trim() === "") {
      return res.render("buscarCursos", { cursos: null, usuario });
    }

    try {
      const cursos = await cursosModel.buscar(nombre, { incluirNoPublicados: esProfesor });
      res.render("buscarCursos", { cursos, usuario });
    } catch (error) {
      console.error("Error al buscar cursos:", error);
      res.status(500).send("Error al buscar curso: " + error.message);
    }
  },

  verCurso: async (req, res) => {
  const idCurso = req.params.idCurso;
  const usuario = req.session.usuario || null;
  const email = usuario?.email_usuario;

  try {
    const curso = await cursosModel.buscarPorId(idCurso);
    const secciones = await seccionesModel.buscarSecciones(idCurso);

    if (!curso) {
      return res.status(404).render("404", {
        title: "Curso no encontrado",
        message: "No se encontró el curso solicitado.",
        usuario
      });
    }

    const estaPublicado = curso.publicado === 'S';

    if (!usuario && !estaPublicado) {
      return res.status(403).render("public/mensaje", {
        titulo: "Curso no disponible",
        mensaje: "Este curso está restringido a usuarios con acceso.",
        link: "/auth/login",
        textoBoton: "Iniciar sesión"
      });
    }

    const esAlumno = usuario ? await inscripcionesModel.esAlumno(idCurso, email) : false;
    const esProfesor = usuario ? await asignacionesModel.esProfesor(idCurso, email) : false;

    const imagenCurso = curso.imagen
      ? `/assets/cursos/${curso.imagen}`
      : `/assets/cursos/default.png`;

    //obtener valoraciones
    const valoraciones = await valoracionesModel.buscarPorCurso(idCurso);

    //calcular promedio de estrellas
    const promedioEstrellas = valoraciones.length
      ? (valoraciones.reduce((acc, v) => acc + v.estrellas, 0) / valoraciones.length).toFixed(1)
      : null;

    res.render("verCurso", {
      curso,
      secciones,
      esAlumno,
      esProfesor,
      estaPublicado,
      usuario,
      imagenCurso,
      valoraciones,           
      promedioEstrellas       
    });

  } catch (error) {
    console.error("Error al cargar el curso:", error);
    res.status(500).render("404", {
      title: "Error",
      message: "No se pudo cargar el curso por un error del servidor.",
      usuario
    });
  }
},

  miCursoAlumno: async (req, res) => {
    return res.redirect("/mis-cursos");
  },

  miCursoProfesor: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      if (!usuario || !usuario.esProfesor) {
        return res.redirect("/auth-login/try");
      }

      const email = usuario.email_usuario;
      const cursos = await cursosModel.obtenerCursosDeProfesor(email);

      res.render("auth/profesor/mis-cursos-profesor", { cursos, usuario });
    } catch (error) {
      console.error("Error al obtener cursos del profesor:", error);
      res.status(500).send("Error del servidor: " + error.message);
    }
  },

  verProfesores: async (req, res) => {
    try {
      const profesores = await usuariosModel.listarProfesores();
      res.render("profesores", {
        profesores,
        usuario: req.session.usuario || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar los profesores");
    }
  },

  inscribirmeComoAlumno: async (req, res) => {
    const { idCurso } = req.params;
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.redirect("/auth-login/try");
    }

    try {
      const { error } = inscripcionSchema.validate({
        id_curso: parseInt(idCurso),
        email_usuario: usuario.email_usuario
      });
      if (error) return res.status(400).send("Datos de inscripción inválidos.");

      const email = usuario.email_usuario;
      const curso = await cursosModel.buscarPorId(idCurso);

      if (!curso) return res.status(404).send("El curso no existe.");
      if (curso.publicado !== 'S') return res.status(400).send("No puedes inscribirte a un curso no publicado.");

      const esProfesor = await asignacionesModel.esProfesor(idCurso, email);
      if (esProfesor) return res.send("No puedes inscribirte porque sos profesor de este curso.");

      const yaInscripto = await inscripcionesModel.esAlumno(idCurso, email);
      if (yaInscripto) return res.send("Ya estás inscripto como alumno en este curso.");

      await inscripcionesModel.inscribirAlumno(idCurso, email);
      res.redirect(`/auth/curso/${idCurso}`);
    } catch (error) {
      console.error("Error al inscribirse:", error);
      res.status(500).send("Error al procesar la inscripción.");
    }
  },

  agregarSeccion: async (req, res) => {
    const idCurso = req.params.idCurso;
    const nombre = req.body.nombre;
    const email = req.session.usuario?.email_usuario;

    try {
      const curso = await cursosModel.buscarPorId(idCurso);

      const esProfesor = await asignacionesModel.esProfesor(idCurso, email);
      if (!curso || !esProfesor) {
        return res.status(403).send("No puedes modificar este curso.");
      }

      if (curso.publicado === 'S') {
        return res.send("Este curso ya fue publicado. No se pueden agregar más secciones.");
      }

      await seccionesModel.agregarSeccion(idCurso, nombre);
      res.redirect(`/auth/curso/${idCurso}`);
    } catch (error) {
      console.error("Error al agregar sección:", error);
      res.status(500).send("Error al agregar sección.");
    }
  },

  publicarCurso: async (req, res) => {
    const idCurso = req.params.idCurso;
    const usuario = req.session.usuario;

    try {
      const curso = await cursosModel.buscarPorId(idCurso);

      const esProfesor = await asignacionesModel.esProfesor(idCurso, usuario.email_usuario);
      if (!curso || !esProfesor) {
        return res.status(403).send("No puedes publicar un curso que no te pertenece.");
      }

      await cursosModel.publicar(idCurso);
      res.redirect(`/auth/curso/${idCurso}`);
    } catch (error) {
      console.error("Error al publicar el curso:", error);
      res.status(500).send("Error al publicar el curso.");
    }
  },

  editar: async (req, res) => {
    const idCurso = req.params.idCurso;
    const curso = await cursosModel.buscarPorId(idCurso);
    res.render("admin/cursos/editar", { curso });
  },

  valorarCurso:  async (req, res) => {
  try {
    // 1. Obtener id_curso desde la URL (params)
    const id_curso = Number(req.params.id_curso);
    if (isNaN(id_curso)) {
      return res.status(400).send("ID de curso inválido");
    }

    // 2. Obtener email_usuario desde la sesión o donde tengas almacenado al usuario
    // Aquí asumo que usas sesiones y guardas el email en req.session.usuario.email
    // Cambia según tu implementación real
    const email_usuario = req.session?.usuario?.email;
    if (!email_usuario) {
      return res.status(401).send("No autorizado. Usuario no identificado.");
    }

    // 3. Obtener estrellas y comentario desde el body
    const { estrellas, comentario } = req.body;

    // Validar que estrellas estén entre 1 y 5
    const estrellasNum = Number(estrellas);
    if (!estrellasNum || estrellasNum < 1 || estrellasNum > 5) {
      return res.status(400).send("Las estrellas deben ser un número entre 1 y 5");
    }

    // 4. Llamar a la función del modelo para guardar o actualizar la valoración
    await valoracionesModel.guardarOActualizar({
      email_usuario,
      idCurso: id_curso,
      estrellas: estrellasNum,
      comentario
    });

    // 5. Redirigir o responder que se guardó correctamente
    res.redirect(`/auth/curso/${id_curso}`);
  } catch (error) {
    console.error("Error al guardar la valoración:", error);
    res.status(500).send("Error al guardar la valoración");
  }
  },

  actualizar: async (req, res) => {
    try {
      const { nombre, precio, estrellas, id_categoria } = req.body;
      const idCurso = req.params.idCurso;
      const curso = await cursosModel.buscarPorId(idCurso);

      await cursosModel.actualizar({ idCurso, nombre, precio, estrellas, id_categoria });

      if (req.file) {
        if (curso.imagen) {
          fs.unlinkSync(path.join("public/assets/cursos", curso.imagen));
        }

        const ext = path.extname(req.file.originalname);
        const nuevoNombre = `${idCurso}${ext}`;
        const rutaNueva = path.join("public/assets/cursos", nuevoNombre);
        fs.renameSync(req.file.path, rutaNueva);
        await cursosModel.actualizarImagen(idCurso, nuevoNombre);
      }

      res.redirect("/admin/home");
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      res.status(500).send("Error al actualizar el curso");
    }
  }
};

module.exports = cursoController;
