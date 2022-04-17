module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("VehicleInventory", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        vehicleId: {
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
        model.hasMany(models.VehicleInventory, {
            as: "children",
            foreignKey: "parentId",
            onDelete: "cascade"
        });

        model.hasMany(models.VehicleInventoryParam, {
            as: "params",
            foreignKey: "itemId"
        });

        model.belongsTo(models.VehicleInventory, {
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
