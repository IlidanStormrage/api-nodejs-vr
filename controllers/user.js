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
  login: function (req, res) {
    //RECOGER LOS PARAMETROS DE LA PETICION
    var params = req.body;

    //VALIDAR DATOS
    var validate_email =
      !validator.isEmpty(params.email) && validator.isEmail(params.email);
    var validate_password = !validator.isEmpty(params.password);

    if (!validate_email || !validate_password) {
      return res.status(200).send({
        message: "Los datos son incorrectos, envialos bien",
      });
    }
    // BUSCAR USUARIOS QUE COINCIDAN CON EL EMAIL
    User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
      if (err) {
        return res.status(500).send({
          message: "Error al intentar identificarse",
        });
      }
      if (!user) {
        // SI SE PONE EL EMAIL MAL
        return res.status(404).send({
          message: "El usuario no existe",
        });
      }
      // SI LO ENCUENTRA,
      // COMPROBAR LA CONTRASEÑA(COINCIDENCIA DE EMAIL Y PASSWORD/BCRYPT)
      bcrypt.compare(params.password, user.password, (err, check) => {
        //SI ES CORRECTO,
        if (check) {
          //GENERAR TOKEN DE JWT Y DEVOLVERLO(MAS TARDE)**
          //DEVOLVER LOS DATOS
          return res.status(200).send({
            status: "success",
            user,
          });
        } else {
          //SI SE PONE LA PASS Y EL USER MAL
          return res.status(200).send({
            message: "Las credenciales no son correctas",
          });
        }
      });
    });
  },
};

//// VIDEO 143 SE QUEDO
module.exports = controller;
