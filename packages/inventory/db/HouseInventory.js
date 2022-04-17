module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("HouseInventory", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        houseId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        itemId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        pocketIndex: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        },
        index: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true
        }
    }, {
        paranoid: true,
        timestamps: true,
    });

    model.associate = (models) => {
        model.hasMany(models.HouseInventory, {
            as: "children",
            foreignKey: "parentId",
            onDelete: "cascade"
        });

        model.hasMany(models.HouseInventoryParam, {
            as: "params",
            foreignKey: "itemId"
        });

        model.belongsTo(models.HouseInventory, {
            as: "parent",
            foreignKey: "parentId"
        });

        model.belongsTo(models.InventoryItem, {
            as: "item",
            foreignKey: "itemId"
        });
    };

    return model;
};
