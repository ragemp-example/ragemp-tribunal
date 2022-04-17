"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Fine", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        copId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        recId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        cause: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 1, 50000);
                this.setDataValue('price', val);
            }
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "copId"
        });
        model.belongsTo(models.Character, {
            foreignKey: "recId"
        });
    };
    return model;
};
