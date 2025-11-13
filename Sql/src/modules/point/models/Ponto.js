// models/Ponto.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Ponto = sequelize.define(
  "Ponto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entrada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    saida: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_on: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
      defaultValue: "pendente",
      allowNull: false,
    },
    aluno_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    calendario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "calendarios",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "pontos",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Ponto;
