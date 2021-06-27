"use strict";
let jwt = require("jwt-simple");
let moment = require("moment");
let secret = "clave-secreta-para-generar-el-token-9999";

//MIDDLEWARE TIENEN TRES PARAMETROS
exports.authenticated = function (req, res, next) {
  //COMPROBAR SI LLEGA AUTORIZACION
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "La peticion no tiene la cabecera de autorizacion",
    });
  }

  //LIMPIAR EL TOKEN Y QUITAR COMILLAS
  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    //DECODIFICAR EL TOKEN
    var payload = jwt.decode(token, secret);
    // COMPROBAR SI EL TOKEN HA EXPIRADO
    if (payload.exp <= moment().unix()) {
      return res.status(404).send({
        message: "El token ha expirado",
      });
    }
  } catch (ex) {
    return res.status(404).send({
      message: "El token no es valido",
    });
  }

  //ADJUNTAR USUARIO IDENTIFICADO A REQUEST
  req.user = payload;

  //PASAR A LA ACCION
  console.log("Estas pasando por el middleware!");
  next();
};
