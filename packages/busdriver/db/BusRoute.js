module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("BusRoute", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        salary: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
        }

    }, { timestamps: false });

    model.associate = (models) => {
        model.hasMany(models.BusRoutePoint, {
            foreignKey: "routeId"
        });
    };

    return model;
};
