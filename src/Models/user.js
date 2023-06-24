const mongoose = require("mongoose");

var uniqueValidator = require("mongoose-unique-validator");

const rolesValidos = {
    values: ["ADMIN", "USER"],
    message: "{VALUE} no es un role valido"
}
const Schema = mongoose.Schema;
const userSchema = new Schema({
    nombre:{
        type: String,
        required: [true, "El nombre es necesario"],
    },
    email:{
        type: String,
        unique: true,
        required: [true, "EL correo es necesario"],
    },
    password:{
        type: String,
        required: [true, "La contraseña es necesaria"]
    },
    role:{
        type: String,
        default: "USER",
        required:true,
        enum:[rolesValidos],
    },
    
});

userSchema.methods.toJSON =function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

userSchema.plugin(uniqueValidator,{
    message: "{PATH} debe ser unico"
})

module.exports = mongoose.model("User", userSchema)