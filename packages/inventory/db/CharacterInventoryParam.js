module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("CharacterInventoryParam", {
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
                var value = this.getDataValue('value');
                if (!isNaN(value)) value = parseFloat(value);
                // if (typeof value == 'string') {
                //     value = value.replace(/(\\)/g, "");
                //     value = value.replace(/(["'])/g, "\\$1");
                // }
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
