// models/TurmaProfessor.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../config/db");

const TurmaProfessor = sequelize.define(
  "TurmaProfessor",
  {
    pk_turma_professor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_turma: {
      type: DataTypes.INTEGER,
      primaryKey: true, 
    },
    id_professor: {
      type: DataTypes.INTEGER,
      primaryKey: true, 
    },
  },
  {
    tableName: "tb_turma_professor",
    timestamps: false,
    underscored: true,
  }
);

module.exports = TurmaProfessor;