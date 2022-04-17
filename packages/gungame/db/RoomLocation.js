module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("RoomLocation", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fX: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        fY: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        fZ: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        sX: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        sY: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        sZ: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
    }, {
        timestamps: false
    });

    return model;
};
