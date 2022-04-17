module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("DrugsStash", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        resources: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1000
        },
        resourcesMax: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 10000
        },
    }, {
        timestamps: false
    });

    return model;
};
