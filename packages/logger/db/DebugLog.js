const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("DebugLog", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        playerId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        text: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        module: {
            type: DataTypes.STRING(50),
            defaultValue: null,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId",
        });
    };

    return model;
};
