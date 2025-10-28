const fs = require("fs");
const path = require("path");

const receberFormulario = (req, res) => {
    try {
        const formData = req.body;
        const arquivoFoto = req.file;

        console.log("=== Formulário Recebido ===");
        console.log(formData);

        if (arquivoFoto) {
            console.log("Arquivo foto recebido:", arquivoFoto.originalname);
        }

        // Assinaturas em base64
        if (formData.assinaturaAluno) console.log("Assinatura Aluno recebida");
        if (formData.assinaturaGerente) console.log("Assinatura Gerente recebida");
        if (formData.assinaturaProf) console.log("Assinatura Profissional recebida");

        return res.status(200).json({ success: true, message: "Formulário recebido!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Erro ao receber formulário" });
    }
};

module.exports = { receberFormulario };
