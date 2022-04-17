module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("Supermarket", {
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
        bType: {
			type: DataTypes.INTEGER(11),
            defaultValue: 0,
			allowNull: false
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
