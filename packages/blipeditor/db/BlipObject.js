"use strict";
const Sequelize = require('sequelize');

/// Модель информации о блипе на карте
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("BlipObject", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            sprite: {
                type: DataTypes.STRING(50),
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
            color: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            dimension: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            scale: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
        },
        {
            timestamps: false
        });
    return model;
};