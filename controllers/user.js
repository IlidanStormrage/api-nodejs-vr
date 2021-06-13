"use strict";
var validator = require("validator");
var User = require("../models/user");
var bcrypt = require("bcrypt-nodejs");

const controller = {
  probando: function (req, res) {
    return res.status(200).send({
      message: "Soy el metodo PROBANDO",
    });
  },
  testeando: function (req, res) {
    return res.status(200).send({
      message: "Soy el metodo TESTEANDO",
    });
  },
  save: function (req, res) {
    //Recoger los parametros de la peticion.
    var params = req.body;
    //Validar los datos. (LIBRERIA VALIDATOR)
    const validate_name = !validator.isEmpty(params.name);
    const validate_surname = !validator.isEmpty(params.surname);
    const validate_email =
      !validator.isEmpty(params.email) && validator.isEmail(params.email);
    const validate_password = !validator.isEmpty(params.password);
    if (
      validate_name &&
      validate_surname &&
      validate_password &&
      validate_email
    ) {
      // Crear objeto de usuario.
      var user = new User();

      //Asignar valores al usuario.
      user.name = params.name;
      user.surname = params.surname;
      user.email = params.email.toLowerCase();
      user.role = "ROLE_USER";
      user.image = null;
      // Comprobar si el usuario existe.
      User.findOne({ email: user.email }, (err, issetUser) => {
        if (err) {
          return res.status(500).send({
            message: "Error al comprobar duplicidad de usuario",
          });
        }
        if (!issetUser) {
          // Si no existe,
          // cifrar la contraseña
          bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            // y guardar usuario.
            user.save((err, userStored) => {
              if (err) {
                return res.status(500).send({
                  message: "Error al guardar el usuario",
                });
              }
              if (!userStored) {
                return res.status(400).send({
                  message: "Error, no se ha guardao el usuario",
                });
              }
              // Devolver respuesta.
              return res.status(200).send({
                status: "success",
                user: userStored,
              });
            }); // close save
          }); // close bcrypt
        } else {
          return res
            .status(200)
            .send({ message: "El usuario ya esta registrado" });
        }
      });
    } else {
      return res.status(200).send({
        message: "La Validacion es incorrecta",
      });
    }
  },
};

module.exports = controller;
