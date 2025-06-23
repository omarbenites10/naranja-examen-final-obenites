DROP TABLE IF EXISTS Asignaciones;
DROP TABLE IF EXISTS Inscripciones;
DROP TABLE IF EXISTS Cursos;
DROP TABLE IF EXISTS Categorias;
DROP TABLE IF EXISTS Tipo_usuario;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Secciones;

-- Tabla: Asignaciones
CREATE TABLE Asignaciones (
    id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curso INTEGER,
    email_usuario TEXT,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso),
    FOREIGN KEY (email_usuario) REFERENCES Usuarios(email_usuario)
);

-- Tabla: Categorias
CREATE TABLE Categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

-- Tabla: Cursos
CREATE TABLE Cursos (
    id_curso INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    id_categoria INTEGER,
    precio NUMERIC,
    estrellas INTEGER,
    publicado TEXT CHECK (publicado IN ('S', 'N')) DEFAULT 'N',
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- Tabla: Inscripciones
CREATE TABLE Inscripciones (
    id_inscripcion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curso INTEGER,
    email_usuario TEXT,
    fecha_inscripcion DATE,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso),
    FOREIGN KEY (email_usuario) REFERENCES Usuarios(email_usuario)
);

-- Tabla: Usuarios
CREATE TABLE Usuarios (
    email_usuario TEXT PRIMARY KEY,
    ci INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    contrasena TEXT NOT NULL
);

-- Tabla: Tipo_usuario
CREATE TABLE Tipo_usuario (
    tipo_usuarios INTEGER PRIMARY KEY,
    email_usuario TEXT,
    nom_tipo_usuario TEXT CHECK (nom_tipo_usuario IN ('P', 'E', 'A')) NOT NULL,
    FOREIGN KEY (email_usuario) REFERENCES Usuarios(email_usuario)
);

-- Tabla: Secciones
CREATE TABLE Secciones (
    id_seccion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curso INTEGER,
    nombre TEXT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);
