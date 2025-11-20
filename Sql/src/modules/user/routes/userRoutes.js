const express = require("express");
const authMiddleware = require("../auth/middleware/authMiddleware");
const userController = require("../controller/userController")

const router = express.Router();

router.get("/usuarios/:id", authMiddleware, userController.usuarioCompleto);
router.get("/listarTurmas", authMiddleware, userController.listarTurmasUsuario);
router.get("/", authMiddleware, userController.userData)
router.put("/password", authMiddleware, userController.updateSenha)

module.exports = router;
