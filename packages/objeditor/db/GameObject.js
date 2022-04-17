"use strict";
const Sequelize = require('sequelize');

/// Модель информации о игровом объекте
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("GameObject", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            model: {
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
            z: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            rotX: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            rotY: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            rotZ: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            alpha: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            dimension: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
        },
        {
            timestamps: false
        });
    return model;
};