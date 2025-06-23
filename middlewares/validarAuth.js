const Joi = require('joi');

// Schema de validación para login
const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'El correo electrónico no es válido.',
            'any.required': 'El correo electrónico es obligatorio.',
            'string.empty': 'El correo electrónico no puede estar vacío.'
        }),
    contrasena: Joi.string()
        .min(6)
        .max(20)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres.',
            'string.max': 'La contraseña no puede superar los 20 caracteres.',
            'any.required': 'La contraseña es obligatoria.',
            'string.empty': 'La contraseña no puede estar vacía.'
        })
});

// Middleware para validar login de usuario
function validarLogin(req, res, next) {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errores = error.details.map(err => err.message);
        return res.status(400).render('public/auth-login/loginAuth', {
            errores,
            oldData: req.body
        });
    }

    next();
}

module.exports = { validarLogin };
