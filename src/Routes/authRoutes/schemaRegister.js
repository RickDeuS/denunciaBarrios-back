const Joi = require('@hapi/joi');

const schemaRegister = Joi.object({
  nombreCompleto: Joi.string()
    .min(6)
    .max(255)
    .required()
    .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      'string.base': 'El nombre completo debe ser una cadena',
      'string.empty': 'El nombre completo no debe estar vacío',
      'string.min': 'El nombre completo debe tener al menos {#limit} caracteres',
      'string.max': 'El nombre completo no debe tener más de {#limit} caracteres',
      'string.pattern.base': 'El nombre completo solo debe contener letras y espacios',
      'any.required': 'El nombre completo es un campo obligatorio',
    }),

  cedula: Joi.string()
    .min(6)
    .max(10)
    .required()
    .pattern(/^[0-9]+$/)
    .messages({
      'string.base': 'La cédula debe ser una cadena',
      'string.empty': 'La cédula no debe estar vacía',
      'string.min': 'La cédula debe tener al menos {#limit} caracteres',
      'string.max': 'La cédula no debe tener más de {#limit} caracteres',
      'string.pattern.base': 'La cédula solo debe contener números',
      'any.required': 'La cédula es un campo obligatorio',
    }),

  numTelefono: Joi.string()
    .min(6)
    .max(10)
    .required()
    .pattern(/^[0-9]+$/)
    .messages({
      'string.base': 'El número de teléfono debe ser una cadena',
      'string.empty': 'El número de teléfono no debe estar vacío',
      'string.min': 'El número de teléfono debe tener al menos {#limit} caracteres',
      'string.max': 'El número de teléfono no debe tener más de {#limit} caracteres',
      'string.pattern.base': 'El número de teléfono solo debe contener números',
      'any.required': 'El número de teléfono es un campo obligatorio',
    }),

  email: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .email()
    .messages({
      'string.base': 'El correo electrónico debe ser una cadena',
      'string.empty': 'El correo electrónico no debe estar vacío',
      'string.min': 'El correo electrónico debe tener al menos {#limit} caracteres',
      'string.max': 'El correo electrónico no debe tener más de {#limit} caracteres',
      'string.email': 'El formato del correo electrónico es incorrecto',
      'any.required': 'El correo electrónico es un campo obligatorio',
    }),

  password: Joi.string()
    .min(6)
    .required()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .messages({
      'string.base': 'La contraseña debe ser una cadena',
      'string.empty': 'La contraseña no debe estar vacía',
      'string.min': 'La contraseña debe tener al menos {#limit} caracteres',
      'any.required': 'La contraseña es un campo obligatorio',
      'string.pattern.base': 'La contraseña solo puede contener letras y números',
    }),

  photo: Joi.string()
    .min(6)
    .max(1024)
    .optional()
    .messages({
      'string.base': 'La foto debe ser una cadena',
      'string.min': 'La foto debe tener al menos {#limit} caracteres',
      'string.max': 'La foto no debe tener más de {#limit} caracteres',
    }),
});

module.exports = schemaRegister;