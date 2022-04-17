const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("AnticheatLog", {
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
        code: {
            type: DataTypes.STRING(50),
            defaultValue: null,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(100),
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
