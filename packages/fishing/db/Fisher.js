module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Fisher", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        x: {
            type: DataTypes.FLOAT(10),
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT(10),
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT(10),
            allowNull: false
        },
        heading: {
            type: DataTypes.INTEGER(10),
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return model;
};