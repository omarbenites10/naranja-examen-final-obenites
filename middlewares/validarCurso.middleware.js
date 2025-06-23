const Joi = require('joi');

// Definimos el schema de validación para crear un curso
const schemaCurso = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto.',
      'string.empty': 'El nombre es obligatorio.',
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre no debe superar los 100 caracteres.',
      'any.required': 'El nombre es obligatorio.'
    }),
    
  id_categoria: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'La categoría debe ser un número.',
      'any.required': 'La categoría es obligatoria.'
    }),

  precio: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'El precio debe ser un número.',
      'number.positive': 'El precio debe ser un número positivo.',
      'any.required': 'El precio es obligatorio.'
    }),

  estrellas: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Las estrellas deben ser un número.',
      'number.integer': 'Las estrellas deben ser un número entero.',
      'number.min': 'Las estrellas deben ser al menos 1.',
      'number.max': 'Las estrellas no pueden ser más de 5.',
      'any.required': 'Las estrellas son obligatorias.'
    })
});

// Middleware para validar el curso
function validarCurso(req, res, next) {
  const { error } = schemaCurso.validate(req.body, { abortEarly: false });

  if (error) {
    const errores = error.details.map(detail => detail.message);
    return res.status(400).render('admin/cursos/nuevo', {
      errores,
      oldData: req.body // mantener datos ingresados
    });
  }

  next();
}

module.exports = validarCurso;