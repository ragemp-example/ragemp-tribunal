module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("MaskShop", {
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
        fittingX: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        fittingY: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        fittingZ: {
            type: DataTypes.FLOAT(11),
            defaultValue: 100,
			allowNull: false
        },
        fittingH: {
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
