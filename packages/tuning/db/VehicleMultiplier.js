module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("VehicleMultiplier", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        power: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        brake: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {timestamps: false});

    return model;
};
