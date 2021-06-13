"use strict";

const controller = {
  probando: function (req, res) {
    return res.status(200).send({
      message: "SOy el metodo PROBANDO",
    });
  },
  testeando: function (req, res) {
    return res.status(200).send({
      message: "SOy el metodo TESTEANDO",
    });
  },
};

module.exports = controller;
