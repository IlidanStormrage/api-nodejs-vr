"use strict";

let express = require("express");
//const { probando } = require("../controllers/user");
let UserController = require("../controllers/user");

let router = express.Router();
let md_auth = require("../middlewares/authenticated");

var multipart = require("connect-multiparty"); // con esta libreria recibes ficheros
var md_upload = multipart({ uploadDir: "./uploads/users" });

router.get("/probando", UserController.probando);
router.post("/testeando", UserController.testeando);

//RUTAS DE USUARIOS
router.post("/register", UserController.save);
router.post("/login", UserController.login);
router.put("/update", md_auth.authenticated, UserController.update);
router.post(
  "/upload-avatar",
  [md_auth.authenticated, md_upload],
  UserController.uploadAvatar
);

module.exports = router;
