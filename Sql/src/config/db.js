const { Sequelize } = require("sequelize");
require("dotenv").config();


const sequelize = new Sequelize(
  process.env.DB_NAME,     // nome do banco
  process.env.DB_USER,     // usuário
  process.env.DB_PASS,     // senha
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // ou true se quiser ver os logs SQL
  }
);

// Função para testar conexão
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MySQL:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
