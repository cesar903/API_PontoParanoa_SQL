const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");
const User = require("../../user/models/User");

const Endereco = sequelize.define(
  "Endereco",
  {
    pk_endereco: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    pk_logradouro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ds_logradouro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ds_numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ds_complemento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nm_bairro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nm_cidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sg_estado: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    nr_cep: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pk_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "pk_usuario",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "tb_enderecos",
    timestamps: false,
    underscored: true,
  }
);

User.hasOne(Endereco, { foreignKey: "pk_usuario" });
Endereco.belongsTo(User, { foreignKey: "pk_usuario" });

module.exports = Endereco;
