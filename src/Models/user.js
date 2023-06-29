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
    required: true,
    min: 3,
    max: 255,
  },
  cedula: {
    type: String,
    unique: true,
    required: true,
    max: 10,
  },
  numTelefono: {
    type: String,
    unique: true,
    required: true,
    max: 10,
    
  },
  email: {
    type: String,
    unique: true,
    required: true,
    min: 6,
    max: 1024,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    default: "USER",
    enum: rolesValidos,
  },
},{ timestamps: true});

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
