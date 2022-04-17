module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("CarList", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        carShowId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        vehiclePropertyModel: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        percentage: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        count: {
            type: DataTypes.INTEGER(11),
            defaultValue: 10,
            allowNull: false
        }
    }, { timestamps: false });

    model.associate = (models) => {
        model.belongsTo(models.CarShow, {
            foreignKey: "carShowId"
        });

        model.belongsTo(models.VehicleProperties, {
            foreignKey: "vehiclePropertyModel"
        });
    };
    return model;
};
