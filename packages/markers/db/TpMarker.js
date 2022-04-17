module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("TpMarker", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(20),
            defaultValue: null,
            allowNull: true
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
        h: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        d: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        blip: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        blipColor: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        tpX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tpY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tpZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tpH: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tpD: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        tpBlip: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        tpBlipColor: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };

    return model;
};
