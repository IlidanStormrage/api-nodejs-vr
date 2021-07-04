"use strict";
var validator = require("validator");
var User = require("../models/user");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
const user = require("../models/user");
var fs = require("fs"); //PERMITE BORRAR FICHEROS
var path = require("path");
const { exec } = require("child_process");

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
    try {
      var validate_name = !validator.isEmpty(params.name);
      var validate_surname = !validator.isEmpty(params.surname);
      var validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      var validate_password = !validator.isEmpty(params.password);
    } catch (err) {
      return res.status(200).send({
        message: "Faltan datos por enviar",
      });
    }

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
    try {
      var validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      var validate_password = !validator.isEmpty(params.password);
    } catch (err) {
      return res.status(200).send({
        message: "Faltan datos por enviar",
      });
    }

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
          if (params.gettoken) {
            //DEVOLVER LOS DATOS
            return res.status(200).send({
              token: jwt.createToken(user),
            });
          } else {
            //LIMPIAR EL OBJETO
            user.password = undefined; // PARA QUE NO SALGA EN EL RETURN
            //DEVOLVER LOS DATOS
            return res.status(200).send({
              status: "success",
              user,
            });
          }
        } else {
          //SI SE PONE LA PASS Y EL USER MAL
          return res.status(200).send({
            message: "Las credenciales no son correctas",
          });
        }
      });
    });
  },
  update: function (req, res) {
    //RECOGER DATOS DEL USUARIO
    var params = req.body;

    //VALIDAR DATOS
    try {
      const validate_name = !validator.isEmpty(params.name);
      const validate_surname = !validator.isEmpty(params.surname);
      const validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
    } catch (err) {
      return res.status(200).send({
        message: "Faltan datos por enviar",
        params,
      });
    }

    // ELIMINAR PROPIEDADES INNECESARIAS
    delete params.password;

    var userId = req.user.sub;
    //console.log(userId);

    //COMPROBAR SI EL EMAIL ES UNICO
    if (req.user.email != params.email) {
      User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
        if (err) {
          return res.status(500).send({
            message: "Error al intentar identificarse",
          });
        }
        if (user && user.email == params.email) {
          // SI SE PONE EL EMAIL MAL
          return res.status(200).send({
            message: "El E-mail no puede ser modificado",
          });
        }
      });
    } else {
      // BUSCAR Y ACTUALIZAR DOCUMENTO DE LAS BASES DE DATOS
      //condicion, datos a actualizar,opciones,callback
      User.findOneAndUpdate(
        { _id: userId },
        params,
        { new: true },
        (err, userUpdated) => {
          if (err) {
            return res.status(500).send({
              status: "error",
              message: "Error al actualizar usuario",
            });
          }
          if (!userUpdated) {
            return res.status(200).send({
              status: "error",
              message: "No se ha actualizado el usuario",
            });
          }
          //DEVOLVER RESPUESTA
          return res.status(200).send({
            status: "success",
            user: userUpdated,
          });
        }
      );
    }
  },
  uploadAvatar: function (req, res) {
    // CONFIGURAR EL MODULO MULTIPARTY(MD)- routes/users.js

    // RECOGER EL FICHERO DE LA PETICION.
    var file_name = "Avatar no subido...";

    if (!req.files) {
      return res.status(404).send({
        status: "error",
        message: file_name,
      });
    }

    // CONSEGUIR EL NOMBRE Y LA EXTENSION DEL ARCHIVO
    var file_path = req.files.file0.path;
    var file_split = file_path.split("\\");

    //**ADVERTENCIA EN LINUX/ MACC \\ POR /

    var file_name = file_split[2]; //NOMBRE DEL ARCHIVO

    //EXTENSION DEL ARCHIVO
    var ext_split = file_name.split("."); // SE BORRA EL BACKSLASH ("\.")
    var file_ext = ext_split[1];

    // COMPROBAR EXTENSION(SOLO IMAGENES), SI NO ES VALIDA BORRAR FICHERO SUBIDO
    if (
      file_ext != "png" &&
      file_ext != "jpg" &&
      file_ext != "jpeg" &&
      file_ext != "gif"
    ) {
      fs.unlink(file_path, e => {
        return res.status(404).send({
          status: "error",
          message: "La extension del archivo no es valida",
          file: file_ext,
        });
      });
    } else {
      //SACAR EL ID DEL USUARIO IDENTIFICADO
      var userId = req.user.sub;

      // BURCAR Y ACTUALIZAR DOCUMENTOS BD
      User.findOneAndUpdate(
        { _id: userId },
        { image: file_name },
        { new: true },
        (err, userUpdated) => {
          if (err || !userUpdated) {
            //DEVOLVER RESPUESTA
            return res.status(500).send({
              status: "error",
              message: "Error al guardar el usuario",
              file: file_ext,
            });
          }
          //DEVOLVER RESPUESTA
          return res.status(200).send({
            status: "success",
            userUpdated,
          });
        }
      );
    }
  },

  avatar: function (req, res) {
    var fileName = req.params.fileName;
    var pathFile = "./uploads/users/" + fileName;

    // FS.EXISTS DEPRECATED
    fs.exists(pathFile, exists => {
      if (exists) {
        return res.sendFile(path.resolve(pathFile));
      } else {
        return res.status(404).send({
          message: "La imagen no existe",
        });
      }
    });
  },
  getUsers: function (req, res) {
    User.find().exec((err, users) => {
      if (err || !users) {
        return res.status(404).send({
          status: "error",
          message: "No hay usuarios que mostrar",
        });
      }
      return res.status(200).send({
        status: "success",
        users,
      });
    });
  },
  getUser: function (req, res) {
    var userId = req.params.userId;

    User.findById(userId).exec((err, user) => {
      if (err || !user) {
        return res.status(404).send({
          status: "error",
          message: "No existe el usuario",
        });
      }
      return res.status(200).send({
        status: "success",
        user,
      });
    });
  },
};

//// VIDEO 154 RENICIAR PARA ENTENDER
module.exports = controller;
