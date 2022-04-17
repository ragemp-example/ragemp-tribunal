"use strict";
const Sequelize = require('sequelize');

/// Модель персоонажа аккаунта
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Appearance", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        value: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        opacity: {
            type: DataTypes.FLOAT(11),
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId"
        });
    };

    return model;
};