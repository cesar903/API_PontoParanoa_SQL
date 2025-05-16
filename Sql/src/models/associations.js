const User = require("./User");
const Ponto = require("./Ponto");
const Calendario = require("./Calendario");
const Falta = require("./Falta");

// Um usuário (aluno) pode ter vários pontos
User.hasMany(Ponto, { foreignKey: "alunoId", as: "pontos" });
Ponto.belongsTo(User, { foreignKey: "alunoId", as: "aluno" });

// Um calendário pode ter vários pontos (relacionar ponto com o dia)
Calendario.hasMany(Ponto, { foreignKey: "calendarioId", as: "pontos" });
Ponto.belongsTo(Calendario, { foreignKey: "calendarioId", as: "calendario" });

// Um usuário (aluno) pode ter várias faltas
User.hasMany(Falta, { foreignKey: "alunoId", as: "faltas" });
Falta.belongsTo(User, { foreignKey: "alunoId", as: "aluno" });

module.exports = { User, Ponto, Calendario, Falta };
