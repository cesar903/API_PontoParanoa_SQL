const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const User = sequelize.define(
  "User",
  {
    pk_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nm_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ds_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ds_senha_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nr_cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    dt_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tp_usuario: {
      type: DataTypes.ENUM("professor", "aluno", "admin"),
      allowNull: false,
    },
    id_professor_tipo: {
      type: DataTypes.ENUM("tecnologia", "ginastica", "karate", "todos"),
      allowNull: true,
    },
    ds_foto_3_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ds_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dt_reset_expira: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dt_atualizado_em: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "usuarios", // SE sua tabela chama `usuarios`
    timestamps: false,
    underscored: true,
  }
);

module.exports = User;
