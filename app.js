"use strict";

// Requires
const express = require("express");
const bodyParser = require("body-parser");

// Ejecutar express

const app = express();

// Cargar archivos de rutas

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors

// Reescribir rutas

//Ruta / metodo de prueba
app.get("/prueba", (req, res) => {
  return res.status(200).send("<h1>Hola Mundo</h1>");
  return res.status(200).send({
    nombre: "raul martinez",
    message: "hola mundo desde el backend con node",
  });
});

app.post("/prueba", (req, res) => {
  return res.status(200).send({
    nombre: "raul martinez",
    message: "Hola mundo desde el backend con node soy un metodo post",
  });
});

//Exportar el modulo
module.exports = app;
