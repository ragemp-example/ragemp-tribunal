module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("Vehicle", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        owner: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        modelName: {
            type: DataTypes.STRING(128),
            defaultValue: "NOTREG",
            allowNull: false
        },
        plate: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        regDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        owners: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
        },
        color1: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        color2: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
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
        h: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fuel: {
            type: DataTypes.INTEGER(11),
            defaultValue: 70,
            allowNull: false
        },
        health: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1000,
            allowNull: false
        },
        destroys: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        engineState: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        steeringState: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        fuelState: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        brakeState: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        dimension: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        mileage: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        parkingId: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        parkingDate: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        // model.hasMany(models.VehicleInventory, {
        //     as: "items",
        //     foreignKey: "vehicleId"
		// });

		// model.hasOne(models.VehicleTuning, {
		// 	foreignKey: "vehicleId",
		// });

		model.hasOne(models.FactionVehicleRank, {
			foreignKey: "vehicleId",
            as: "minRank"
		});
    };

    return model;
};
