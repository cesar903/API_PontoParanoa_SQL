const { Sequelize } = require("sequelize");

// Configuração manual (sem .env)
const sequelize = new Sequelize(
  "escolinhaparanoa_escola_digital", // nome do banco
  "escolinhaparanoa",                // usuário
  "p4Ran0aCp4nel",                   // senha
  {
    host: "localhost",
    dialect: "mysql",
    logging: false, // deixa true se quiser ver os logs SQL
  }
);

// Função para testar a conexão
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