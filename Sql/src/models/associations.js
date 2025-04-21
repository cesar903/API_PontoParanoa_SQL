const User = require("./User");
const Ponto = require("./Ponto");
const Calendario = require("./Calendario");

// Um usuário (aluno) pode ter vários pontos
User.hasMany(Ponto, { foreignKey: "alunoId", as: "pontos" });
Ponto.belongsTo(User, { foreignKey: "alunoId", as: "aluno" });

// Um calendário pode ter vários pontos (relacionar ponto com o dia)
Calendario.hasMany(Ponto, { foreignKey: "calendarioId", as: "pontos" });
Ponto.belongsTo(Calendario, { foreignKey: "calendarioId", as: "calendario" });

module.exports = { User, Ponto, Calendario };
