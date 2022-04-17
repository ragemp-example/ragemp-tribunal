module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("PeaceZone", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        x: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
        y: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
        z: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
        dx: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
        dy: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
        dz: {
            type: DataTypes.FLOAT(11),
            defaultValue: null,
            allowNull: true
        },
    }, {timestamps: false});

    return model;
};
