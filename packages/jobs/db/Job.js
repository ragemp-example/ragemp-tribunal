module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Job", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
    }, {
        timestamps: false
    });

    return model;
};
