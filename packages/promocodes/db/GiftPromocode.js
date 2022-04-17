"use strict";
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("GiftPromocode", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        // Промокод
        promocode: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        // Обработчик выдачи подарка
        rewardId: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        data: {
            type: DataTypes.STRING(128),
            defaultValue: null,
            allowNull: true,
            get() {
                var val = this.getDataValue('data');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('data', val);
            }
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };
    return model;
};
