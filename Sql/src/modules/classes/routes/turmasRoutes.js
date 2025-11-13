const express = require("express");
const router = express.Router();
const { listarTurmasUsuario } = require("../../classes/controller/turmasControler");
const authMiddleware = require("../../user/auth/middleware/authMiddleware");

router.get("/", authMiddleware, listarTurmasUsuario);

module.exports = router;
