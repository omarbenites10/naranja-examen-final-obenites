-- CATEGORÍAS
INSERT INTO Categorias
    (id_categoria, nombre, imagen)
VALUES
    (19, 'Programación', '19.jpg'),
    (20, 'Diseño', '20.jpg'),
    (21, 'Matemática', '21.jpg');

-- CURSOS
INSERT INTO Cursos
    (id_curso, nombre, id_categoria, precio, estrellas, publicado, imagen, comentario)
VALUES
    (19, 'JavaScript Básico', 19, 150000, 4, 'S', 'curso19.jpg', 'Muy buen curso. Aprendí mucho.'),
    (20, 'Diseño UX/UI', 20, 180000, 5, 'N', 'curso20.jpg', 'Muy buen curso.'),
    (21, 'Álgebra Lineal', 21, 120000, 3, 'S', 'curso21.jpg', 'Aprendí mucho.');

-- USUARIOS (ALUMNOS + PROFESOR)
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena, imagen)
VALUES
    ('alumno1@correo.com', 12345678, 'Alumno Uno', '$2b$10$QKy2TcqfnOE59/DaWz.BVe9tk2MdJj8yEBucvvKbmTMD6I0rIJcFO', 'alumno1.jpg');
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena)
VALUES
    ('alumno2@correo.com', 23456789, 'Alumno Dos', '$2b$10$8F.eZK1hG.X2XfOsvQaycuZkHffQKQ9Tb/WrdZ/y9CN/2cyeT1JzK', 'alumno2.jpg');
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena)
VALUES
    ('alumno3@correo.com', 34567890, 'Alumno Tres', '$2b$10$zPg8rqi6e6PzIfOqqZZt9O.fLjzMoLJcbAg61dv1lnzUldIHfM4gW', 'alumno3.jpg');
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena)
VALUES
    ('alumno4@correo.com', 45678901, 'Alumno Cuatro', '$2b$10$QfTwlUbZ63rIXTDxq31ruOXauFzSCmo7m7KeA4QCSm3vlvSmD75Xm', 'alumno4.jpg');
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena)
VALUES
    ('profesor1@correo.com', 98765432, 'Carlos Gómez', '$2b$10$F4e4V59F3CgRIpYLu16bp.kOqJGy/dmvU1Ugmcf4nxH1AKY/Rm/Ni', 'profesor1.jpg');
INSERT INTO Usuarios
    (email_usuario, ci, nombre, contrasena, imagen)
VALUES
    ('admin1@correo.com', 11223344, 'Administrador Uno', '$2b$10$XxsJz6qaErEQ7pGzLvs0AupkOVKDLncUGPhYB5Q14Lh1pFQgcqCsy', 'admin1.jpg');
UPDATE Usuarios
    SET contrasena = '$2b$10$QytyRnrygFXu7OlgHrAEUOOB6XWeiKCBMcGLNxHxrxXyU5Ef1rEq.'
    WHERE email_usuario = 'admin1@correo.com';


-- TIPOS DE USUARIO
INSERT INTO Tipo_Usuario
    (email_usuario, nom_tipo_usuario)
VALUES
    ('alumno1@correo.com', 'E'),
    ('alumno2@correo.com', 'E'),
    ('alumno3@correo.com', 'E'),
    ('alumno4@correo.com', 'E'),
    ('profesor1@correo.com', 'P'),
    ('admin1@correo.com', 'A');

-- INSCRIPCIONES
INSERT INTO Inscripciones
    (id_inscripcion, id_curso, email_usuario, fecha_inscripcion)
VALUES
    (19, 19, 'alumno1@correo.com', '2025-04-01'),
    (20, 20, 'alumno2@correo.com', '2025-04-03'),
    (21, 21, 'alumno1@correo.com', '2025-04-05'),
    (22, 19, 'alumno3@correo.com', '2025-04-06'),
    (23, 21, 'alumno4@correo.com', '2025-04-06');

-- ASIGNACIONES DE PROFESOR
INSERT INTO Asignaciones
    (id_asignacion, id_curso, email_usuario)
VALUES
    (19, 19, 'profesor1@correo.com'),
    (20, 20, 'profesor1@correo.com'),
    (21, 21, 'profesor1@correo.com');

-- SECCIONES DE CURSOS
INSERT INTO Secciones
    (id_seccion, id_curso, nombre)
VALUES
    (19, 19, 'Introducción a JavaScript'),
    (20, 19, 'Variables y Tipos de Datos'),
    (21, 20, 'Fundamentos del Diseño UX'),
    (22, 21, 'Vectores y Matrices'),
    (23, 21, 'Transformaciones Lineales');

-- UPDATE con contraseñas generadas usando bcryptjs

UPDATE Usuarios SET contrasena = '$2b$10$QytyRnrygFXu7OlgHrAEUOOB6XWeiKCBMcGLNxHxrxXyU5Ef1rEq.' WHERE email_usuario = 'alumno1@correo.com';
UPDATE Usuarios SET contrasena = '$2b$10$Ob60wQia.bFjjcxwlDZZwef93NbdvErBmPo9rEdNkXO3C8Li97ReC' WHERE email_usuario = 'alumno2@correo.com';
UPDATE Usuarios SET contrasena = '$2b$10$dIuK1UHtC/cTuIx.LERw1.qqqY4srFF3PtKHSxr4b0dMlxdIz93F.' WHERE email_usuario = 'alumno3@correo.com';
UPDATE Usuarios SET contrasena = '$2b$10$WwypJheaqlGsG0dG38eg2uC8XPxCyLQBlTtwCq/0DNaz/mTYZPgn6' WHERE email_usuario = 'alumno4@correo.com';
UPDATE Usuarios SET contrasena = '$2b$10$VNYH7GmfedpP6rwqzMM/uuQ.4Le0qcqt6yLbzJWqqIDG69qp7QhC6' WHERE email_usuario = 'profesor1@correo.com';