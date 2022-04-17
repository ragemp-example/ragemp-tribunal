module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Fish", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        minWeight: {
            type: DataTypes.FLOAT(10),
            allowNull: false
        },
        maxWeight: {
            type: DataTypes.FLOAT(10),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER(10),
            allowNull: false
        },
    }, {
        timestamps: false
    });

    return model;
};