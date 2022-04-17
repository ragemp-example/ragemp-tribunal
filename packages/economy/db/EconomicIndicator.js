module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("EconomicIndicator", {
        type: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, { timestamps: false });


    return model;
};
