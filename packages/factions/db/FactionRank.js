module.exports = (sequelize, DataTypes) => {
	const model = sequelize.define("FactionRank", {
		id: {
			type: DataTypes.INTEGER(11),
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(40),
			allowNull: false
		},
		rank: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		pay: {
			type: DataTypes.INTEGER(11),
			defaultValue: 100,
			allowNull: false
		},
		factionId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
	}, {
		timestamps: false
	});

	return model;
};
