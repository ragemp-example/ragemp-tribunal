"use strict";
const Sequelize = require('sequelize');

let settings = call('settings');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("CharacterSettings", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        // Место спавна (0 - улица, 1 - дом, 2 - организация)
        spawn: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 2);
                this.setDataValue('spawn', val);
            },
        },
        // Время в чате
        chatTimestamp: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 1);
                this.setDataValue('chatTimestamp', val);
            },
        },
        // Размер чата
        chatSize: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 3);
                this.setDataValue('chatSize', val);
            },
        },
        // Ники над головой
        nicknames: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 1);
                this.setDataValue('nicknames', val);
            },
        },
        // Подсказки кнопок на экране
        hudKeys: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 1);
                this.setDataValue('hudKeys', val);
            },
        },
        // Зоны гетто/бизваров на экране
        ghetto: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 1);
                this.setDataValue('ghetto', val);
            },
        },
        // Походка
        walking: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, settings.walkingCount - 1);
                this.setDataValue('walking', val);
            },
        },
        // Эмоция
        mood: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, settings.moodCount - 1);
                this.setDataValue('mood', val);
            },
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            as: "settings",
            foreignKey: "characterId",
        });
    };
    return model;
};
