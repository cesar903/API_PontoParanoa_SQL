const express = require("express");
const { sequelize, connectDB } = require("./src/config/db");
const cors = require("cors");
require("dotenv").config();
const app = express();

require("./src/models/associations");

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rotas
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/alunos", require("./src/routes/alunoRoutes"));
app.use("/professores", require("./src/routes/professorRoutes"));
app.use("/me", require("./src/routes/userRoutes"));

app.get("/test", (req, res) => {
  res.json({ msg: "✅ API conectada com sucesso!" });
});

// Inicializa o banco e inicia o servidor
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    return sequelize.sync({ alter: true }); // <-- aqui ele cria/atualiza as tabelas
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
