const adminModel = require("../../models/admin.model");
const asignacionesModel = require("../../models/asignaciones.model");
const cursosModel = require("../../models/curso.model");
const categoriasModel = require("../../models/categoria.model");
const usuariosModel = require("../../models/usuario.model");
const inscripcionesModel = require("../../models/inscripciones.model"); // AGREGADO
const tipousuariosModel = require("../../models/tipo.usuario.model");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const agregarLogAdmin = require("../../utils/logAdmin");

const adminController = {
  home: async (req, res) => {
    const usuario = req.session.usuario;

    let esAlumno = false;
    let esProfesor = false;
    let esAdmin = false;

    if (usuario && usuario.email_usuario) {
      const email = usuario.email_usuario;

      const inscripciones = await cursosModel.obtenerCursosComoAlumno(email);
      esAlumno = inscripciones.length > 0;

      const asignaciones = await cursosModel.obtenerCursosDeProfesor(email);
      esProfesor = asignaciones.length > 0;

      esAdmin = await usuariosModel.esAdmin(email);
    }

    res.render("admin/adminHome", {
      usuario,
      esAlumno,
      esProfesor,
      esAdmin,
    });
  },

  listarCategorias: async (req, res) => {
    try {
      const categorias = await categoriasModel.listarConCantidadCursos();
      res.render("admin/categorias", { categorias });
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      res.status(500).send("Error al cargar categorías");
    }
  },

  formNuevaCategoria: (req, res) => {
    res.render("admin/categorias/nuevaCategoria", { error: null });
  },

  crearCategoria: async (req, res) => {
    const { nombre } = req.body;
    const imagen = req.file;

    if (!nombre || nombre.trim() === "") {
      return res.render("admin/categorias/nuevaCategoria", {
        error: "El nombre no puede estar vacío.",
      });
    }

    try {
      const existe = await categoriasModel.obtenerPorNombre(nombre);
      if (existe) {
        return res.render("admin/categorias/nuevaCategoria", {
          error: "Ya existe una categoría con ese nombre.",
        });
      }

      const resultado = await categoriasModel.crear(nombre.trim(), "default.jpg");
      const idCategoria = resultado.lastID;

      if (imagen && imagen.originalname) {
        const extension = path.extname(imagen.originalname).toLowerCase();
        const nuevoNombre = `${idCategoria}${extension}`;
        const rutaActual = imagen.path;
        const rutaNueva = path.join(__dirname, "../../assets/categorias", nuevoNombre);

        fs.renameSync(rutaActual, rutaNueva);

        await categoriasModel.actualizar(idCategoria, nombre.trim(), nuevoNombre);
      } else if (imagen?.path && fs.existsSync(imagen.path)) {
        fs.unlinkSync(imagen.path);
      }

      agregarLogAdmin({
        usuario: req.session.usuario?.email_usuario || "desconocido",
        recurso: "Categoria",
        id: idCategoria,
      });

      res.redirect("/admin/categorias");
    } catch (error) {
      console.error("❌ Error al crear categoría:", error);
      res.render("admin/categorias/nuevaCategoria", {
        error: "Hubo un error al crear la categoría.",
      });
    }
  },

  formEditarCategoria: async (req, res) => {
    const { id } = req.params;
    try {
      const categoria = await categoriasModel.obtenerPorId(id);
      if (!categoria) return res.redirect("/admin/categorias");
      res.render("admin/categorias/editarCategoria", { categoria, error: null });
    } catch (error) {
      console.error("Error al cargar categoría:", error);
      res.status(500).send("Error al cargar la categoría.");
    }
  },

  editarCategoria: async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const nuevaImagen = req.file;

    if (!nombre || nombre.trim() === "") {
      return res.render("admin/categorias/editarCategoria", {
        categoria: { id_categoria: id, nombre },
        error: "El nombre no puede estar vacío.",
      });
    }

    try {
      const categoriaActual = await categoriasModel.obtenerPorId(id);
      const existe = await categoriasModel.obtenerPorNombre(nombre);

      if (existe && existe.id_categoria != id) {
        return res.render("admin/categorias/editarCategoria", {
          categoria: { id_categoria: id, nombre },
          error: "Ya existe una categoría con ese nombre.",
        });
      }

      if (nuevaImagen) {
        const extension = path.extname(nuevaImagen.originalname);
        const nuevoNombre = `${id}${extension}`;
        const rutaNueva = path.join(__dirname, "../../assets/categorias", nuevoNombre);

        fs.renameSync(nuevaImagen.path, rutaNueva);

        if (categoriaActual.imagen && categoriaActual.imagen !== "default.jpg") {
          const rutaAnterior = path.join(__dirname, "../../assets/categorias", categoriaActual.imagen);
          if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);
        }

        await categoriasModel.actualizar(id, nombre.trim(), nuevoNombre);
      } else {
        await categoriasModel.actualizar(id, nombre.trim(), categoriaActual.imagen);
      }

      res.redirect("/admin/categorias");
    } catch (error) {
      console.error("Error al editar categoría:", error);
      res.render("admin/categorias/editarCategoria", {
        categoria: { id_categoria: id, nombre },
        error: "Hubo un error al actualizar la categoría.",
      });
    }
  },

  eliminarCategoria: async (req, res) => {
    const { id } = req.params;
    try {
      await categoriasModel.eliminar(id);
      res.redirect("/admin/categorias");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      const categorias = await categoriasModel.listarConCantidadCursos();
      res.render("admin/categorias", {
        categorias,
        error: "No se puede eliminar la categoría porque tiene cursos asociados.",
      });
    }
  },

  vistaAsignarProfesor: async (req, res) => {
    try {
      const cursos = await cursosModel.listarTodos(); // <-- usar el método más completo
      const profesores = await usuariosModel.listarProfesores();
      res.render("admin/asignarProfesor", { cursos, profesores, error: null }); // <-- nombre y error actualizado
    } catch (error) {
      console.error("Error al cargar vista asignar profesor:", error.message, error.stack);
      res.status(500).send("Error al cargar la vista");
    }
  },

  insertarAsignacion: async (req, res) => {
    const { id_curso, email_usuario } = req.body;
    try {
      await asignacionesModel.insertarAsignacion(id_curso, email_usuario);
      res.redirect("/admin/asignaciones-profesor");
    } catch (error) {
      console.error("Error al asignar profesor:", error.message);
      const cursos = await cursosModel.listarTodos();
      const profesores = await usuariosModel.listarProfesores();

      res.render("admin/asignarProfesor", { cursos, profesores, error: "Ya existe una asignación..." });
    }
  },

  listarUsuarios: async (req, res) => {
    try {
      const usuarios = await usuariosModel.obtenerTodos();
      res.render("admin/listadoUsuarios", { usuarios });
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      res.status(500).send("Error al listar usuarios");
    }
  },

  formCrearUsuario: (req, res) => {
    res.render("admin/nuevoUsuario", { error: null });
  },

  crearUsuario: async (req, res) => {
    const { nombre, email, password, ci } = req.body;
    // "roles" puede ser array o string
    let roles = req.body.roles;
    if (!Array.isArray(roles)) {
      roles = roles ? [roles] : [];
    }

    if (!email || !nombre || !password || !ci || roles.length === 0) {
      return res.render("admin/nuevoUsuario", {
        error: "Todos los campos son obligatorios.",
      });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      await usuariosModel.crearUsuario({ nombre, email_usuario: email, contrasena: hash, ci });

      // Asigna todos los roles según el value ("P", "E", "A")
      for (let tipo of roles) {
        await tipousuariosModel.asignarTipoUsuario(email, tipo);
      }

      // AGREGADO PARA DEBUG: Mostramos todo lo que hay en la tabla Tipo_usuario
      const tipos = await tipousuariosModel.listar();
      console.log("TABLA Tipo_usuario:", tipos);

      res.redirect("/admin/usuarios");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.render("admin/nuevoUsuario", {
        error: "Hubo un error al crear el usuario.",
      });
    }
  },

  formEditarUsuario: async (req, res) => {
    const { id } = req.params;
    try {
      const usuario = await usuariosModel.obtenerPorId(id);
      res.render("admin/usuarios/editarUsuario", { usuario, error: null });
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      res.status(500).send("Error al cargar usuario");
    }
  },

  editarUsuario: async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo } = req.body;

    if (!nombre || !tipo) {
      const usuario = await usuariosModel.obtenerPorId(id);
      return res.render("admin/usuarios/editarUsuario", {
        usuario,
        error: "Todos los campos son obligatorios.",
      });
    }

    try {
      await usuariosModel.actualizar(id, nombre, tipo);
      res.redirect("/admin/usuarios");
    } catch (error) {
      console.error("Error al editar usuario:", error);
      res.status(500).send("Error al editar usuario");
    }
  },

  verAsignacionesProfesor: async (req, res) => {
    try {
      const asignaciones = await asignacionesModel.listarAsignacionesConDatos();
      res.render("admin/asignacionesProfesor", {
        asignaciones,
        msg: null
      });
    } catch (error) {
      console.error("Error al listar asignaciones:", error.message, error.stack);
      res.status(500).send("Error al listar asignaciones");
    }
  },

  eliminarAsignacion: async (req, res) => {
    const { id_asignacion } = req.params;
    try {
      await asignacionesModel.eliminar(id_asignacion);
      res.redirect("/admin/asignaciones-profesor");
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      res.status(500).send("Error al eliminar asignación");
    }
  },

  verCursoAdmin: async (req, res) => {
    try {
      const idCurso = req.params.id;
      const curso = await cursosModel.buscarPorId(idCurso);
      if (!curso) {
        return res.status(404).render("404", {
          message: "Curso no encontrado",
          usuario: req.session.usuario
        });
      }

      res.render("admin/cursos/verCursoAdmin", { curso, usuario: req.session.usuario });
    } catch (error) {
      console.error("Error al cargar curso:", error);
      res.status(500).send("Error al cargar curso");
    }
  },

  listarCursosAdmin: async (req, res) => {
    try {
      const cursos = await cursosModel.listarTodos();
      res.render("admin/cursos/verCursos", {
        cursos,
        usuario: req.session.usuario
      });
    } catch (error) {
      console.error("Error al listar cursos:", error);
      res.status(500).send("Error al cargar los cursos.");
    }
  },

  formEditarCurso: async (req, res) => {
    try {
      const idCurso = req.params.id;
      const curso = await cursosModel.buscarPorId(idCurso);
      if (!curso) return res.status(404).send("Curso no encontrado.");
      res.render("admin/cursos/editarCurso", { curso });
    } catch (error) {
      console.error("Error al cargar edición:", error);
      res.status(500).send("Error al cargar edición.");
    }
  },

  editarCurso: async (req, res) => {
    try {
      const idCurso = req.params.id;
      const { nombre, precio, estrellas, imagenOriginal } = req.body;

      let nuevaImagen = imagenOriginal;

      if (req.file) {
        nuevaImagen = req.file.filename;

        if (imagenOriginal && imagenOriginal !== "generica.jpg") {
          const rutaVieja = `./assets/cursos/${imagenOriginal}`;
          if (fs.existsSync(rutaVieja)) {
            fs.unlinkSync(rutaVieja);
          }
        }
      }

      await cursosModel.actualizarCurso(idCurso, {
        nombre,
        precio,
        estrellas,
        imagen: nuevaImagen
      });

      res.redirect(`/admin/cursos/${idCurso}/ver`);
    } catch (error) {
      console.error("Error al editar curso:", error);
      res.status(500).send("Error al editar curso");
    }
  },

  verEstadisticas: async (req, res) => {
    try {
      const totalCursos = await cursosModel.contarTodos();
      const cursosPublicados = await cursosModel.contarPublicados();
      const cursosNoPublicados = await cursosModel.contarNoPublicados();

      const totalUsuarios = await usuariosModel.contarTodos();
      const totalAlumnos = await usuariosModel.contarPorTipo("E");
      const totalProfesores = await usuariosModel.contarPorTipo("P");

      const totalUsuariosInscriptos = await inscripcionesModel.contarUsuariosUnicosInscriptos();
      const totalAsignaciones = await asignacionesModel.contarTodas();
      const totalInscripciones = await inscripcionesModel.contarTodas();

      res.render("admin/estadisticas", {
        totalCursos,
        cursosPublicados,
        cursosNoPublicados,
        totalUsuarios,
        totalAlumnos,
        totalProfesores,
        totalUsuariosInscriptos,
        totalAsignaciones,
        totalInscripciones
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      res.status(500).send("Error al cargar estadísticas");
    }
  }
};

module.exports = adminController;
