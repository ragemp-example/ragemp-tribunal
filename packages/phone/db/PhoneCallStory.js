"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("PhoneCallStory", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            phoneId: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            number: {
                type: DataTypes.STRING(16),
                allowNull: false
            },
            type: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
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