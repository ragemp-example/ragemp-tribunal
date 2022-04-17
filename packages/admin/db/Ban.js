module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Ban", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        ip: {
            type: DataTypes.STRING(40),
            defaultValue: null,
            allowNull: true
        },
        socialClub: {
            type: DataTypes.STRING(128),
            defaultValue: null,
            allowNull: true
        },
        serial: {
            type: DataTypes.STRING(128),
            defaultValue: null,
            allowNull: true
        },
        reason: {
            type: DataTypes.STRING(128),
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
