"use strict";
const Sequelize = require('sequelize');

/// Модель мест в гараже
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("GaragePlace", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        garageId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        angle: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Garage, {
            foreignKey: "garageId"
        });
    };
    return model;
};