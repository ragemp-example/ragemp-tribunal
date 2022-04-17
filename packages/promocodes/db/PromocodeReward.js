"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("PromocodeReward", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        // Награда владельцу промокода
        ownerSum: {
            type: DataTypes.INTEGER(11),
            defaultValue: 2000,
            allowNull: false
        },
        // Награда тому, кто выполнил условия
        playerSum: {
            type: DataTypes.INTEGER(11),
            defaultValue: 10000,
            allowNull: false
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };
    return model;
};
