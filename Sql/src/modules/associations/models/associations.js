const User = require("../../user/models/User");
const Turmas = require("../../classes/models/Turmas");
const AlunoTurmas = require("../../classesStudents/models/alunosTurmas");
const Ponto = require("../../point/models/Ponto");
const Faltas = require("../../fouls/models/Faltas");
const Mensagem = require("../../messages/models/Mensagem");
const Calendario = require("../../calendar/models/Calendario");


User.hasMany(Ponto, {
    foreignKey: "id_aluno",
    sourceKey: "pk_usuario",
    as: "pontos",
});
Ponto.belongsTo(User, {
    foreignKey: "id_aluno",
    targetKey: "pk_usuario",
    as: "aluno",
});

User.hasMany(Faltas, {
    foreignKey: "id_aluno",
    sourceKey: "pk_usuario",
    as: "faltas",
});
Faltas.belongsTo(User, {
    foreignKey: "id_aluno",
    targetKey: "pk_usuario",
    as: "aluno",
});

Calendario.hasMany(Ponto, {
    foreignKey: "id_calendario",
    as: "pontos",
});
Ponto.belongsTo(Calendario, {
    foreignKey: "id_calendario",
    as: "calendario",
});

Calendario.hasMany(Faltas, {
    foreignKey: "id_calendario",
    as: "faltas",
});
Faltas.belongsTo(Calendario, {
    foreignKey: "id_calendario",
    as: "calendario",
});


User.hasMany(Mensagem, {
    foreignKey: "id_remetente",
    sourceKey: "pk_usuario",
    as: "mensagensEnviadas",
});
User.hasMany(Mensagem, {
    foreignKey: "id_destinatario",
    sourceKey: "pk_usuario",
    as: "mensagensRecebidas",
});

Mensagem.belongsTo(User, {
    foreignKey: "id_remetente",
    targetKey: "pk_usuario",
    as: "remetente",
});
Mensagem.belongsTo(User, {
    foreignKey: "id_destinatario",
    targetKey: "pk_usuario",
    as: "destinatario",
});


User.hasMany(Turmas, {
    foreignKey: "id_professor",
    sourceKey: "pk_usuario",
    as: "turmasMinistradas",
});
Turmas.belongsTo(User, {
    foreignKey: "id_professor",
    targetKey: "pk_usuario",
    as: "professor",
});


User.belongsToMany(Turmas, {
    through: AlunoTurmas,
    foreignKey: "id_aluno",
    otherKey: "id_turma",
    sourceKey: "pk_usuario",
    as: "turmas",
});

Turmas.belongsToMany(User, {
    through: AlunoTurmas,
    foreignKey: "id_turma",
    otherKey: "id_aluno",
    targetKey: "pk_usuario",
    as: "alunos",
});


Turmas.hasMany(Calendario, {
    foreignKey: "id_turma",
    as: "calendarios",
});
Calendario.belongsTo(Turmas, {
    foreignKey: "id_turma",
    as: "turma",
});

module.exports = {
    User,
    Turmas,
    AlunoTurmas,
    Ponto,
    Faltas,
    Mensagem,
    Calendario,
};
