"use strict";
const Sequelize = require('sequelize');

/// Модель интерьера в доме
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Interior", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        garageId: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        class: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        numRooms: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        rent: {
            type: DataTypes.FLOAT,
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
        hX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        hY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        hZ: {
            type: DataTypes.FLOAT,
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
