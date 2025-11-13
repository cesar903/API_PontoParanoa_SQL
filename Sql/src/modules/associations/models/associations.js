const User = require("../../user/models/User");
const Turmas = require("../../classes/models/Turmas");
const AlunoTurmas = require("../../classesStudents/models/alunosTurmas");
const Ponto = require("../../point/models/Ponto");
const Faltas = require("../../fouls/models/Faltas");
const Mensagem = require("../../messages/models/Mensagem");
const Calendario = require("../../calendar/models/Calendario");
const AlunosTurmas = require("../../classesStudents/models/alunosTurmas");


User.hasMany(Ponto, { foreignKey: "aluno_id", as: "pontos" });
Ponto.belongsTo(User, { foreignKey: "aluno_id", as: "aluno" });

User.hasMany(Faltas, { foreignKey: "aluno_id", as: "faltas" });
Faltas.belongsTo(User, { foreignKey: "aluno_id", as: "aluno" });


Calendario.hasMany(Ponto, { foreignKey: "calendario_id", as: "pontos" });
Ponto.belongsTo(Calendario, { foreignKey: "calendario_id", as: "calendario" });

Calendario.hasMany(Faltas, { foreignKey: "calendario_id", as: "faltas" });
Faltas.belongsTo(Calendario, { foreignKey: "calendario_id", as: "calendario" });


User.hasMany(Mensagem, { foreignKey: "remetente_id", as: "mensagensEnviadas" });
User.hasMany(Mensagem, { foreignKey: "destinatario_id", as: "mensagensRecebidas" });
Mensagem.belongsTo(User, { foreignKey: "remetente_id", as: "remetente" });
Mensagem.belongsTo(User, { foreignKey: "destinatario_id", as: "destinatario" });


User.hasMany(Turmas, { foreignKey: "professor_id", as: "turmasMinistradas" });
Turmas.belongsTo(User, { foreignKey: "professor_id", as: "professor" });


User.belongsToMany(Turmas, {
    through: AlunoTurmas,
    foreignKey: "aluno_id",
    otherKey: "turma_id",
    as: "turmas",
});

Turmas.belongsToMany(User, {
    through: AlunoTurmas,
    foreignKey: "turma_id",
    otherKey: "aluno_id",
    as: "alunos",
});


Turmas.hasMany(Calendario, { foreignKey: "turma_id", as: "calendarios" });
Calendario.belongsTo(Turmas, { foreignKey: "turma_id", as: "turma" });


module.exports = {
    User,
    Turmas,
    AlunosTurmas,
    Ponto,
    Faltas,
    Mensagem,
    Calendario,
};
