const express = require("express");
const router = express.Router();
const multer = require("multer");
const { receberFormulario } = require("../controllers/acronisController");

const upload = multer(); 

router.post("/formulario", upload.single("foto"), receberFormulario);

module.exports = router;
