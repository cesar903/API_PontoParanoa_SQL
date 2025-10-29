const receberFormulario = (req, res) => {
    try {
        const formData = req.body; 
        const arquivoPDF = req.file; 

        console.log("=== Formulário Recebido ===");
        console.log("Campos do formulário:", formData);

        if (arquivoPDF) {
            console.log("PDF recebido:", arquivoPDF.originalname);
        } else {
            console.log("Nenhum PDF recebido!");
        }

        return res.status(200).json({ success: true, message: "Formulário recebido!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Erro ao receber formulário" });
    }
};

module.exports = { receberFormulario };
