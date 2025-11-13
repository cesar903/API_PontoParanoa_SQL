const express = require("express");
const { login, redefinirSenha, solicitarRecuperacaoSenha } = require("../controller/authController");

const router = express.Router();

// Rota de login
router.post("/login", login);

// Rota para solicitar recuperação de senha
router.post("/recuperar-senha", solicitarRecuperacaoSenha); 

// Rota para redefinir senha usando um token de recuperação
router.post("/resetar-senha/:token", redefinirSenha); 

module.exports = router;
