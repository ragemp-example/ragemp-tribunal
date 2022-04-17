"use strict";
const Sequelize = require('sequelize');

/// Модель телефона персоонажа
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("PhoneMessage", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        phoneDialogId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        isMine: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        text: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        isRead: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "phoneDialogId"
        });
    };
    return model;
};