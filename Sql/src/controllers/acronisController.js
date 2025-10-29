require("dotenv").config();
const axios = require("axios");

const receberFormulario = async (req, res) => {
    try {
        const arquivoPDF = req.file;
        if (!arquivoPDF) return res.status(400).json({ success: false, message: "Nenhum PDF recebido!" });

    

        // === Gerar token Acronis ===
        const tokenResponse = await axios.post(
            `${process.env.ACRONIS_DATACENTER_URL}/api/2/idp/token`,
            new URLSearchParams({
                grant_type: "password",
                client_id: process.env.ACRONIS_CLIENT_ID,
                client_secret: process.env.ACRONIS_CLIENT_SECRET,
                username: process.env.ACRONIS_USERNAME,
                password: process.env.ACRONIS_PASSWORD
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        const token = tokenResponse.data.access_token;
        if (!token) throw new Error("Não foi possível gerar token Acronis");

        // === Encontrar ou Criar pasta ===
        const folderName = "incricoesProjetosSociais";
        const listFoldersResp = await axios.get(
            `${process.env.ACRONIS_DATACENTER_URL}/fc/api/v1/sync_and_share_nodes`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const nodes = listFoldersResp.data || [];
        let folder = nodes.find(f => f.name.toLowerCase() === folderName.toLowerCase() && f.is_directory && !f.is_deleted);

        let folderUUID;
        if (folder) {
            folderUUID = folder.uuid;
            console.log(`Usando pasta existente: ${folderUUID}`);
        } else {
            // Criar pasta se não existir
            const createFolderResp = await axios.post(
                `${process.env.ACRONIS_DATACENTER_URL}/fc/api/v1/sync_and_share_nodes`,
                { name: folderName, type: "folder" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            folderUUID = createFolderResp.data.uuid;
            console.log(`Pasta criada: ${folderUUID}`);
        }

        const fileBuffer = arquivoPDF.buffer;
        const fileName = arquivoPDF.originalname;
        const fileSize = fileBuffer.length;


        // === Upload DIRETO dos bytes do arquivo (Buffer) ===
        const uploadUrl = `${process.env.ACRONIS_DATACENTER_URL}/fc/api/v1/sync_and_share_nodes/${folderUUID}/upload?filename=${encodeURIComponent(fileName)}&size=${fileSize}`;

        const uploadResp = await axios.post(
            uploadUrl,
            fileBuffer,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/octet-stream", 
                    "Content-Length": fileSize 
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        return res.status(200).json({
            success: true,
            message: "PDF enviado com sucesso para o Acronis!",
            acronisData: uploadResp.data
        });

    } catch (error) {
        console.error("Erro no receberFormulario:", error.response?.data || error.message);
        // Retorna o erro específico do Acronis se estiver disponível
        const errorMessage = error.response?.data?.error?.message || error.message; 
        return res.status(500).json({ success: false, message: `Erro ao enviar para Acronis: ${errorMessage}` });
    }
};

module.exports = { receberFormulario };