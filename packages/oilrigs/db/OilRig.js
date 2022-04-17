module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("OilRig", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        x: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null
        },
        oil: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        oilMax: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1000
        },
        oilPrice: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 50
        },
        isActive: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0
        },
        bizId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.belongsTo(models.Biz, {
            foreignKey: "bizId"
        });
    };

    return model;
};