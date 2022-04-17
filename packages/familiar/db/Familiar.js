module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Familiar", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterA: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        characterB: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            as: "characterOne",
            foreignKey: "characterA",
        });
        model.belongsTo(models.Character, {
            as: "characterTwo",
            foreignKey: "characterB"
        });
    };

    return model;
};
