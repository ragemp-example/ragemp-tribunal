"use strict";
const Sequelize = require('sequelize');

/// Модель информации о микрофоне
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Microphone", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
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