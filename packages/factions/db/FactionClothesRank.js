module.exports = (sequelize, DataTypes) => {
	const model = sequelize.define("FactionClothesRank", {
		id: {
			type: DataTypes.INTEGER(11),
			primaryKey: true,
			autoIncrement: true
		},
		factionId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		clothesIndex: {
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
