const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Falta = sequelize.define("Falta", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // ou o nome correto da tabela de usuários
      key: "id",
    },
    onDelete: "CASCADE",
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  justificada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  motivo: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
}, {
  tableName: "faltas", // nome da tabela no banco
  timestamps: false,
});

module.exports = Falta;
