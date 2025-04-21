const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Ponto = sequelize.define("Ponto", {
  entrada: { type: DataTypes.DATE, allowNull: true },
  saida: { type: DataTypes.DATE, allowNull: true },
  isOn: { type: DataTypes.BOOLEAN, allowNull: true },
  status: {
    type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
    defaultValue: "pendente",
    allowNull: false,
  }
}, {
  tableName: "pontos",
  timestamps: false
});

module.exports = Ponto;
