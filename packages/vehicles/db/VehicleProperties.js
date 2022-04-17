module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("VehicleProperties", {
		model: {
			type: DataTypes.STRING(128),
			primaryKey: true
        },
        name: {
			type: DataTypes.STRING(128),
			allowNull: true
        },
        vehType: {
			type: DataTypes.INTEGER(11),
            defaultValue: 0,
			allowNull: false
        },
        price: {
            type: DataTypes.INTEGER(11),
            defaultValue: 100000,
			allowNull: false
        },
        maxFuel: {
            type: DataTypes.INTEGER(11),
            defaultValue: 50,
			allowNull: false
        },
        consumption: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
			allowNull: false
        },
        license: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
			allowNull: false
        },
        isElectric: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
			allowNull: false
        },
        trunkType: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
			allowNull: false
        },
	}, {timestamps: false});


	return model;
};
