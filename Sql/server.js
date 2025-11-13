const express = require("express");
const { sequelize, connectDB } = require("./src/config/db");
const cors = require("cors");
require("dotenv").config();
const app = express();
require("./src/modules/associations/models/associations");


// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rotas
app.use("/api/auth", require("./src/modules/user/auth/routes/authRoutes"));
app.use("/api/alunos", require("./src/modules/user/student/routes/alunoRoutes"));
app.use("/api/professores", require("./src/modules/user/teacher/routes/professorRoutes"));
app.use("/api/me", require("./src/modules/user/routes/userRoutes"));
app.use("/api/mensagens", require("./src/modules/messages/routes/mensagemRoutes"));
app.use("/api/contatos", require("./src/modules/messages/routes/contatoRoutes"));
app.use("/api/acronis", require("./src/modules/acronis/routes/acronisRoutes"));
app.use("/api/usuario", require("./src/modules/classes/routes/turmasRoutes"));



app.get("/api/test", (req, res) => {
  res.json({ msg: "✅ API conectada com sucesso!" });
});

// Inicializa o banco e inicia o servidor
const PORT = process.env.PORT ;

connectDB()
  .then(() => {
    return sequelize.sync();
  })
  .then(() => {
    console.log("🗄️ Banco de dados conectado com sucesso!");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar com o banco de dados:", err);
  });
