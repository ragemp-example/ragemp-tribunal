"use strict";
const Sequelize = require('sequelize');

/// Модель гаража в доме
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Garage", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        carPlaces: {
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
        rotation: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        exitX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
    }, 
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.hasMany(models.GaragePlace, {
            foreignKey: "garageId"
        });
        model.hasMany(models.Interior, {
            foreignKey: "garageId"
        });
    };

    return model;
};