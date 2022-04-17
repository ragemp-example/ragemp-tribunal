"use strict";
const Sequelize = require('sequelize');

/// Модель персоонажа аккаунта
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("JobSkill", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        jobId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        exp: {
            type: DataTypes.FLOAT(11),
            defaultValue: 0,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 100);
                this.setDataValue('exp', val);
            }
        },
    },
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId"
        });
        model.belongsTo(models.Job, {
            foreignKey: "jobId"
        });
    };

    return model;
};
