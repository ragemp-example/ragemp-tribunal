module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("BandZone", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        x: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        y: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        factionId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Faction, {
            as: "owner",
            foreignKey: "factionId"
        });
    };

    return model;
};
