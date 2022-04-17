module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Club", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        bizId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        blip: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        alcoholPrice: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        enterX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        enterY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        enterZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        enterH: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exitH: {
            type: DataTypes.FLOAT,
            allowNull: false
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
