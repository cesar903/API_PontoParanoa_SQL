const express = require("express");
const authMiddleware = require("../../auth/middleware/authMiddleware");
const { 
    verPontos, 
    fazerCheckin, 
    verCalendarioAluno, 
    fazerCheckout, 
    adicionarPontoManual, 
    verAvisos, 
    verPontosComAlunos, 
    verAniversariantesDoMes  
} = require("../../student/controller/alunoController");

const router = express.Router();

// Rota para ver os pontos de um aluno
router.get("/pontos", authMiddleware, verPontos);

// Rota para ver os pontos de um aluno específico
router.get("/:alunoId/pontos", authMiddleware, verPontos);

// Rota para fazer check-in
router.post("/ponto", authMiddleware, fazerCheckin);

// Rota para ver o calendário do aluno
router.get("/calendario", authMiddleware, verCalendarioAluno);

// Rota para fazer checkout
router.post("/checkout", authMiddleware, fazerCheckout);

// Rota para adicionar ponto manualmente (somente para professor ou admin)
router.post("/ponto/manual", authMiddleware, adicionarPontoManual);

// Rota para ver avisos
router.get("/avisos", authMiddleware, verAvisos);

// Rota para ver pontos e dados de alunos
router.get("/pontos/com-alunos", verPontosComAlunos);

// Rota para ver aniversariantes do mês
router.get("/aniversariantes", authMiddleware, verAniversariantesDoMes);

module.exports = router;
