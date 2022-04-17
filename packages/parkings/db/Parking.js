module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("Parking", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
			type: DataTypes.STRING(128),
			allowNull: true
        },
        x: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        carX: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        carY: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        carZ: {
            type: DataTypes.FLOAT,
            defaultValue: 100,
			allowNull: false
        },
        carH: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
			allowNull: false
        }
	}, {timestamps: false});


	return model;
};
