module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("CharacterTattoo", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        collection: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hashName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zoneId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
	}, {timestamps: false});

	return model;
};
