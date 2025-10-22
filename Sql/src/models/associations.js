const User = require("./User");
const Ponto = require("./Ponto");
const Calendario = require("./Calendario");
const Falta = require("./Falta");
const Mensagem = require("./Mensagem");

// Relacionamentos anteriores
User.hasMany(Ponto, { foreignKey: "alunoId", as: "pontos" });
Ponto.belongsTo(User, { foreignKey: "alunoId", as: "aluno" });

Calendario.hasMany(Ponto, { foreignKey: "calendarioId", as: "pontos" });
Ponto.belongsTo(Calendario, { foreignKey: "calendarioId", as: "calendario" });

User.hasMany(Falta, { foreignKey: "alunoId", as: "faltas" });
Falta.belongsTo(User, { foreignKey: "alunoId", as: "aluno" });

// 🔹 Relacionamentos da Mensagem
User.hasMany(Mensagem, { foreignKey: "remetenteId", as: "mensagensEnviadas" });
User.hasMany(Mensagem, { foreignKey: "destinatarioId", as: "mensagensRecebidas" });
Mensagem.belongsTo(User, { foreignKey: "remetenteId", as: "remetente" });
Mensagem.belongsTo(User, { foreignKey: "destinatarioId", as: "destinatario" });

module.exports = { User, Ponto, Calendario, Falta, Mensagem };
