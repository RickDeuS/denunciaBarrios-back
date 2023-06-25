const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const rolesValidos = {
    values: ["ADMIN", "USER"],
    message: "{VALUE} no es un rol válido",
};

const Schema = mongoose.Schema;

const userSchema = new Schema({
    nombreCompleto: {
    type: String,
    required: [true, "El nombre es necesario"],
  },
  cedula: {
    type: String,
    unique: true,
    required: true,
  },
  numTelefono: {
    type: String,
    unique: true,
    required: true
    
  },
  email: {
    type: String,
    unique: true,
    required: [true, "El correo es necesario"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es necesaria"],
  },
  role: {
    type: String,
    default: "USER",
    enum: rolesValidos,
  },
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.plugin(uniqueValidator, {
  message: "{PATH} debe ser único",
});

module.exports = mongoose.model("User", userSchema);
