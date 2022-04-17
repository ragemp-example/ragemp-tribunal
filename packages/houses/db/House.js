"use strict";
const Sequelize = require('sequelize');

/// Модель информации о доме
module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("House", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        interiorId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        characterNick: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        isOpened: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        pickupX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        pickupY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        pickupZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        spawnX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        spawnY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        spawnZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        angle: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        carX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        carY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        carZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        carAngle: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        holder: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0,
            allowNull: false
        },
    },
    {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId"
        });
        model.belongsTo(models.Interior, {
            foreignKey: "interiorId"
        });
        // model.hasMany(models.HouseInventory, {
        //     as: "items",
        //     foreignKey: "houseId"
		// });
    };
    return model;
};
