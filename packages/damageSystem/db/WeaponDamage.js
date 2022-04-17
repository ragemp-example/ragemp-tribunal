"use strict";
const Sequelize = require('sequelize');

/// Модель информации о игровом объекте
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("WeaponDamage", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            hash: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            value: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
        },
        {
            timestamps: false
        });
    return model;
};