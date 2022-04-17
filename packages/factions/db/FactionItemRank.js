module.exports = (sequelize, DataTypes) => {
	const model = sequelize.define("FactionItemRank", {
		id: {
			type: DataTypes.INTEGER(11),
			primaryKey: true,
			autoIncrement: true
		},
		factionId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		itemId: {
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

	// model.associate = (models) => {
    //     model.belongsTo(models.InventoryItem, {
    //         as: "item",
    //         foreignKey: "itemId"
    //     });
    // };

	return model;
};
