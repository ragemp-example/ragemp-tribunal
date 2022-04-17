module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("BusRoutePoint", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        routeId: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        isStop: {
			type: DataTypes.TINYINT(1),
			defaultValue: 0,
			allowNull: false
		},

    }, { timestamps: false });

    model.associate = (models) => {
        model.belongsTo(models.BusRoute, {
            foreignKey: "routeId"
        });
    };

    return model;
};
