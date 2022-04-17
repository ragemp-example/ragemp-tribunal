module.exports = (sequelize, DataTypes) => {
	const model = sequelize.define("FactionVehicleRank", {
		id: {
			type: DataTypes.INTEGER(11),
			primaryKey: true,
			autoIncrement: true
		},
		vehicleId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		rank: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
	}, {
		timestamps: false
	});

	return model;
};
