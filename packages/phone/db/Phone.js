"use strict";
const Sequelize = require('sequelize');

/// Модель телефона персоонажа
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Phone", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        number: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        money: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId"
        });
        model.hasMany(models.PhoneContact, {
            foreignKey: "phoneId"
        });
        model.hasMany(models.PhoneCallStory, {
            foreignKey: "phoneId"
        });
        model.hasMany(models.PhoneDialog, {
            foreignKey: "phoneId"
        });
    };
    return model;
};