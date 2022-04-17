module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Command", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        cmd: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        access: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };

    return model;
};
