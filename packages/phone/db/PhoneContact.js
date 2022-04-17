"use strict";
const Sequelize = require('sequelize');

/// Модель телефона персоонажа
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("PhoneContact", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        phoneId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        number: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Phone, {
            foreignKey: "phoneId"
        });
    };
    return model;
};