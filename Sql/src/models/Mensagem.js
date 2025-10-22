const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Mensagem = sequelize.define("Mensagem", {
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  remetenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  destinatarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: "mensagens",
});

module.exports = Mensagem;
