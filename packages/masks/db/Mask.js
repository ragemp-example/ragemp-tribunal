"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Mask", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        drawable: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: 'Маска',
            allowNull: false
        },
        price: {
            type: DataTypes.STRING,
            defaultValue: 100,
            allowNull: false
        },
        isAvailable: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1
        }
    }, 
    {
        timestamps: false
    });


    return model;
};