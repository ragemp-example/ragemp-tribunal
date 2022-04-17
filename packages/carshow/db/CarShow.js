module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("CarShow", {
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
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        y: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        z: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        cameraX: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        cameraY: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        cameraZ: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        toX: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        toY: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        toZ: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        toH: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        returnX: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        returnY: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        returnZ: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        returnH: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        blipId: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
			allowNull: false
        },
        blipColor: {
            type: DataTypes.INTEGER(11),
            defaultValue: 4,
			allowNull: false
        }
	}, {timestamps: false});


	return model;
};
