"use strict";

let express = require("express");
let TopicController = require("../controllers/topic");

var router = express.Router();
var md_auth = require("../middlewares/authenticated");

router.get("/test", TopicController.test);
router.post("/topic", md_auth.authenticated, TopicController.save);

router.get("/topics/:page?", TopicController.getTopics); /// '?' si no llega a las otras paginas sera a pag.01
module.exports = router;
