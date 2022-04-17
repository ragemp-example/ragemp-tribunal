module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Notification", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        header: {
            type: DataTypes.STRING(50),
            defaultValue: null,
            allowNull: true,
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
