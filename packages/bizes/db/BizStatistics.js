module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("BizStatistics", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        bizId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        money: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
    }, { timestamps: false });

    model.associate = (models) => {
        model.belongsTo(models.Biz, {
            foreignKey: "bizId"
        });
    };

    return model;
};