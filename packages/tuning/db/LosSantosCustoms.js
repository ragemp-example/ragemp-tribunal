module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("LosSantosCustoms", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        bizId: {
			type: DataTypes.INTEGER(11),
            defaultValue: null,
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
        tuneX: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        tuneY: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        tuneZ: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        tuneH: {
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
        priceMultiplier: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0,
            allowNull: false
        }
	}, {timestamps: false});

    model.associate = (models) => {
        model.belongsTo(models.Biz, {
            foreignKey: "bizId"
        });
    };

	return model;
};
