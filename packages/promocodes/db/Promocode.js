"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Promocode", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        // Собственный промокод
        promocode: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        // Награда за выполнение
        rewardId: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        // Кол-во приглашённых
        invited: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
        },
        // Кол-во выполнивших условие
        completed: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
        },
        // Является ли персонаж ютубером/стримером и пр. медиа
        media: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0,
            allowNull: false
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId",
        });
        model.belongsTo(models.PromocodeReward, {
            foreignKey: "rewardId",
        });
    };
    return model;
};
