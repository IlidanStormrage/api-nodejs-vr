"use strict";

var validator = require("validator");
const topic = require("../models/topic");
var Topic = require("../models/topic");

var controller = {
  test: function (req, res) {
    return res.status(200).send({
      message: "Hola que tal",
    });
  },
  save: function (req, res) {
    // RECOGER LOS PARAMETROS POR POST
    var params = req.body; // GRACIAS AL BODYPARSER LO CONVIERTE EN UN OBJT DE JAVASCRIPT

    // VALIDAR LOS DATOS
    try {
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
      var validate_lang = !validator.isEmpty(params.lang);
    } catch (err) {
      return res.status(200).send({
        message: "Faltan datos por enviar",
      });
    }

    if (validate_content && validate_title && validate_lang) {
      // CREAR OBJETO A GUARDAR
      var topic = new Topic();
      // ASIGNAR VALORES
      topic.title = params.title;
      topic.content = params.content;
      topic.code = params.code;
      topic.lang = params.lang;
      topic.user = req.user.sub;

      // GUARDAR EL TOPIC
      topic.save((err, topicStored) => {
        if (err || !topicStored) {
          res.status(404).send({
            status: "error",
            message: "El tema no se ha guardado",
          });
        }
        // DEVOLVER UNA RESPUESTA
        return res.status(200).send({
          status: "success",
          topic: topicStored,
        });
      });
    } else {
      return res.status(200).send({
        message: "Los datos no son validos",
      });
    }
  },

  getTopics: function (req, res) {
    // CARGA LA LIBRERIA DE PAGINACION EN LA CLASE(MODELO)

    // RECOGER LA PAGINA ACTUAL

    if (
      !req.params.page ||
      req.params.page == null ||
      req.params.page == undefined ||
      req.params.page == 0 ||
      req.params.page == "0"
    ) {
      var page = 1;
    } else {
      var page = parseInt(req.params.page);
    }

    //INDICAR LAS OCPIONES DE PAGINACION
    var options = {
      sort: { date: -1 }, // 1 es de mas viejo a mas nuevo y -1 lo contrario,
      populate: "user", // SIRVE PARA CARGAR EL OBJETO DE USER EN LOS PARAMS DEL TOPICS QUE DE POR SI SE LE ADICIONO YA USER.SUB
      limit: 5,
      page: page,
    };

    // FIND PAGINADO
    Topic.paginate({}, options, (err, topics) => {
      if (err) {
        return res.status(500).send({
          status: "error",
          message: "error al hacer la consulta",
        });
      }
      if (!topics) {
        return res.status(404).send({
          status: "error",
          message: "no hay topics",
        });
      }

      //Devolver resultados(topics, total de topics, total de paginas)
      return res.status(200).send({
        status: "success",
        topics: topics.docs,
        totalDocs: topics.totalDocs,
        totalPage: topics.totalPages,
      });
    });
  },
  getTopicsByUser: function (req, res) {
    //CONSEGUIR EL ID DEL USUARIO
    var userId = req.params.user;

    //HACER FIND CON UNA CONDICION DE USUARIO
    Topic.find({
      user: userId,
    })
      .sort([["date", "descending"]])
      .exec((err, topics) => {
        if (err) {
          //DEVOLVER UN RESULTADO
          return res.status(500).send({
            status: "error",
            message: "Error en la peticion",
          });
        }
        if (!topics) {
          //DEVOLVER UN RESULTADO
          return res.status(404).send({
            status: "error",
            message: "no hay temas para mostrar",
          });
        }

        //DEVOLVER UN RESULTADO
        return res.status(200).send({
          status: "success",
          topics,
        });
      });
  },

  getTopic: function (req, res) {
    //SACAR EL ID DEL TOPIC DE LA URL
    var topicId = req.params.id;

    // FIND POR ID DEL TOPIC
    Topic.findById(topicId)
      .populate("user")
      .exec((err, topic) => {
        if (err) {
          return res.status(500).send({
            status: "error",
            message: "error en la peticion",
          });
        }
        if (!topic) {
          return res.status(404).send({
            status: "error",
            message: "no existe el topic",
          });
        }

        //DEVOLVER RESULTADO
        return res.status(200).send({
          status: "success",
          topic,
        });
      });
  },
};

///TERINE EL VIDEO 163
module.exports = controller;
