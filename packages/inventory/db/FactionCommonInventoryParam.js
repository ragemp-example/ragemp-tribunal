module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("FactionCommonInventoryParam", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                let value = this.getDataValue('value');
                if (!isNaN(value)) value = parseFloat(value);
                return value;
            }
        },
        itemId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return model;
};
