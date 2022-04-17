module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("Tattoo", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        collection: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hashNameMale: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hashNameFemale: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zoneId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
	}, {timestamps: false});

	return model;
};
