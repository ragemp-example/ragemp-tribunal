module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("WhiteList", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        socialClub: {
			type: DataTypes.STRING,
			allowNull: false
        }

	}, {timestamps: false});

	return model;
};
