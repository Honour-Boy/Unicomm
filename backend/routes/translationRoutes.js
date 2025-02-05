const express = require("express");
const { translate } = require("../controllers/translationController");

const router = express.Router();

router.post("/translate", translate);

module.exports = router;