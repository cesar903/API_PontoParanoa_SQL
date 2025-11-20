const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const authMiddleware = require("../../auth/middleware/authMiddleware");
const { 
    listarPontosPendentes, 
    aprovarOuRejeitarPonto, 
    adicionarPontoManual, 
    cadastrarDiaLetivo, 
    listarCalendario, 
    atualizarDiaLetivo,
    cadastrarUsuario,
    excluirDiaLetivo,
    listarAlunos,
    adicionarAviso,
    gerarRelatorio,
    editarPonto,
    excluirAluno,
    atualizarAluno,
    contarFaltas,
    excluirPonto,
    finalizarPonto,
    enviarRelatorio,
    adicionarFaltaJustificada,
    excluirFaltaJustificada,
    listarTurmas,

} = require("../../teacher/controller/professorController");

const router = express.Router();

const professorMiddleware = (req, res, next) => {
    if (req.user.role !== "professor") {
        return res.status(403).json({ msg: "Acesso negado. Apenas professores podem acessar essa rota." });
    }
    next();
};

router.get("/pontos/pendentes", authMiddleware, professorMiddleware, listarPontosPendentes);
router.patch("/ponto/:id", authMiddleware, professorMiddleware, aprovarOuRejeitarPonto);
router.delete("/ponto/:id", authMiddleware, professorMiddleware, excluirPonto);
router.patch("/ponto/editar/:id", authMiddleware, professorMiddleware, editarPonto);
router.put('/ponto/finalizar-ponto/:id', authMiddleware, professorMiddleware, finalizarPonto);
router.post("/ponto/manual", authMiddleware, professorMiddleware, adicionarPontoManual);
router.get("/alunos", authMiddleware, professorMiddleware, listarAlunos);
router.delete("/alunos/:id", authMiddleware, professorMiddleware, excluirAluno);
router.put("/alunos/:id", authMiddleware, professorMiddleware, atualizarAluno);
router.get("/calendario", authMiddleware, professorMiddleware, listarCalendario);
router.post("/calendario", authMiddleware, professorMiddleware, cadastrarDiaLetivo);
router.put("/calendario/:id", authMiddleware, professorMiddleware, atualizarDiaLetivo);
router.delete("/calendario/:id", authMiddleware, professorMiddleware, excluirDiaLetivo);
router.patch("/calendario/:turmaId/:data/aviso", authMiddleware, professorMiddleware, adicionarAviso);
router.put("/calendario/:turmaId/:data/aviso", authMiddleware, professorMiddleware, adicionarAviso);
router.get("/contar-faltas/:alunoId", authMiddleware, professorMiddleware, contarFaltas);
router.post("/usuarios", authMiddleware, professorMiddleware, cadastrarUsuario);
router.get("/relatorio/:alunoId", authMiddleware, professorMiddleware, gerarRelatorio);
router.post("/enviar-relatorio/:alunoId", authMiddleware, professorMiddleware, upload.single('relatorio'), enviarRelatorio);
router.post("/falta-justificada/:alunoId", authMiddleware, professorMiddleware, adicionarFaltaJustificada);
router.delete("/falta/:faltaId", authMiddleware, professorMiddleware, excluirFaltaJustificada);
router.get("/turmas", authMiddleware, professorMiddleware, listarTurmas);


module.exports = router;
