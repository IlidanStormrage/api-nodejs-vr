"use strict";

let express = require("express");
//const { probando } = require("../controllers/user");
let UserController = require("../controllers/user");

let router = express.Router();
let md_auth = require("../middlewares/authenticated");

router.get("/probando", UserController.probando);
router.post("/testeando", UserController.testeando);

//RUTAS DE USUARIOS
router.post("/register", UserController.save);
router.post("/login", UserController.login);
router.put("/update", md_auth.authenticated, UserController.update);

module.exports = router;
