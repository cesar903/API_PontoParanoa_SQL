const express = require("express");
const router = express.Router();
const multer = require("multer");
const { receberFormulario } = require("../controllers/acronisController");

const upload = multer(); // memoryStorage padrão

// Recebe PDF e assinaturas
router.post("/formulario", upload.single("formularioPDF"), receberFormulario);


module.exports = router;
