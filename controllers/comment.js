"use strict";
var validator = require("validator");
var Topic = require("../models/topic");
var controller = {
  add: function (req, res) {
    //RECOGER EL ID DEL TOPIC DE LA URL
    var topicId = req.params.topicId;
    //FIND POR ID DEL TOPIC
    Topic.findById(topicId).exec((err, topic) => {
      if (err) {
        return res.status(500).send({
          status: "Error",
          message: "Error en la peticion",
        });
      }
      if (!topic) {
        return res.status(404).send({
          status: "Error",
          message: "No existe el tema",
        });
      }

      //COMPROBADOR OBJT USUARIO Y VALIDAR DATOS
      if (req.body.content) {
        // VALIDAR LOS DATOS
        try {
          var validate_content = !validator.isEmpty(req.body.content);
        } catch (err) {
          return res.status(200).send({
            message: "No has comentado nada",
          });
        }
        if (validate_content) {
          var comment = {
            user: req.user.sub,
            content: req.body.content,
          };
          //EN LA PROPIEDAD COMMENTS DEL OBJ RESULTANTE HACER UN PUSH
          topic.comments.push(comment);

          //GUARDAR EL TOPIC COMPLETO
          topic.save(err => {
            if (err) {
              return res.status(500).send({
                status: "Error",
                message: "Error al guardar el comentario",
              });
            }
            //DEVOLVER RESPUESTA
            return res.status(200).send({
              status: "success",
              topic,
            });
          });
        } else {
          return res.status(200).send({
            message: "No se han validado los datos del comentario",
          });
        }
      }
    });
  },
  update: function (req, res) {
    // CONSEGUIR DE COMENTARIO QUE LLEGA DE LA URL
    var commentId = req.params.commentId;

    // RECOGER DATOS Y VALIDAR
    var params = req.body;
    // VALIDAR LOS DATOS
    try {
      var validate_content = !validator.isEmpty(params.content);
    } catch (err) {
      return res.status(200).send({
        message: "No has comentado nada",
      });
    }
    if (validate_content) {
      // FIND AND UPDATE DE SUBDOCUMENTO
      Topic.findOneAndUpdate(
        { "comments._id": commentId },
        {
          $set: { "comments.$.content": params.content },
        },
        { new: true },
        (err, topicUpdated) => {
          if (err) {
            return res.status(500).send({
              status: "Error",
              message: "Error en la peticion",
            });
          }
          if (!topicUpdated) {
            return res.status(404).send({
              status: "Error",
              message: "No existe el tema",
            });
          }
          // DEVOLVER LOS DATOS
          return res.status(200).send({
            status: "success",
            topic: topicUpdated,
          });
        }
      );
    }
  },
  delete: function (req, res) {
    // SACAR EL ID DEL TOPIC Y DEL COMENTARIO
    var topicId = req.params.topicId;
    var commentId = req.params.commentId;

    // BUSCAR EL TOPIC
    Topic.findById(topicId, (err, topic) => {
      if (err) {
        return res.status(500).send({
          status: "Error",
          message: "Error en la peticion",
        });
      }
      if (!topic) {
        return res.status(404).send({
          status: "Error",
          message: "No existe el tema",
        });
      }
      //SELECCIONAR EL SUBDOCUMENTO(COMENTARIO)
      var comment = topic.comments.id(commentId);

      // BORRAR EL COMENTARIO
      if (comment) {
        comment.remove();
        // GUARDAR EL TOPIC
        topic.save(err => {
          if (err) {
            return res.status(500).send({
              status: "Error",
              message: "Error en la peticion",
            });
          }

          //DEVOLVER  UN RESULTADO
          return res.status(200).send({
            status: "success",
            topic,
          });
        });
      } else {
        return res.status(200).send({
          message: "NO existe el comentario",
        });
      }
    });
  },
};

module.exports = controller;
