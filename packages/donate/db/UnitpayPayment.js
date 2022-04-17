module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("UnitpayPayment", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        unitpayId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sum: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        itemsCount: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        dateCreate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        dateComplete: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true,
        },
        status: {
            type: DataTypes.TINYINT(4),
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };

    return model;
};
