module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("InventoryItem", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
            get() {
                var value = this.getDataValue('name');
                // if (typeof value == 'string') {
                //     value = value.replace(/(\\)/g, "");
                //     value = value.replace(/(["'])/g, "\\$1");
                // }
                return value;
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                var value = this.getDataValue('description');
                // if (typeof value == 'string') {
                //     value = value.replace(/(\\)/g, "");
                //     value = value.replace(/(["'])/g, "\\$1");
                // }
                return value;
            },
        },
        height: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        width: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 1,
            allowNull: false
        },
        chance: {
            type: DataTypes.INTEGER(3),
            defaultValue: 50,
            allowNull: false,
            set(val) {
                val = Math.clamp(val, 0, 100);
                this.setDataValue('chance', val);
            }
        },
        model: {
            type: DataTypes.STRING(128),
            defaultValue: sequelize.literal("'hei_prop_heist_deposit_box'"),
            allowNull: false
        },
        deltaZ: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        rX: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        rY: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        attachInfo: {
            type: DataTypes.STRING(128),
            defaultValue: JSON.stringify({
                bone: 11363,
                pos: [0.08, -0.15, -0.25],
                rot: [-100, 0, 0],
                anim: 0
            }),
            allowNull: false,
            get() {
                var val = this.getDataValue('attachInfo');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('attachInfo', val);
            }
        }
    }, {
        timestamps: false
    });

    model.associate = (models) => {
        model.hasMany(models.CharacterInventory, {
            as: "iventoryPlayers",
            foreignKey: "itemId"
        });
    };

    return model;
};
