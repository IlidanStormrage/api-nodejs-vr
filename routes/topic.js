"use strict";

let express = require("express");
let TopicController = require("../controllers/topic");

var router = express.Router();
var md_auth = require("../middlewares/authenticated");

router.get("/test", TopicController.test);
router.post("/topic", md_auth.authenticated, TopicController.save);

router.get("/topics/:page?", TopicController.getTopics); /// '?' si no llega a las otras paginas sera a pag.01
router.get("/user-topics/:user?", TopicController.getTopicsByUser);
router.get("/topic/:id", TopicController.getTopic);

router.put("/topic/:id", md_auth.authenticated, TopicController.update);

router.delete("/topic/:id", md_auth.authenticated, TopicController.delete);
module.exports = router;
