const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Seat", {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            x: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            y: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            z: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            rot: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            offset: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            dimension: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
        },
        {
            timestamps: false
        });
    return model;
};