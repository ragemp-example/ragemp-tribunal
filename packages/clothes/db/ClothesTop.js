module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("ClothesTop", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
            get() {
                var value = this.getDataValue('name');
                value = value.replace(/(\\)/g, "");
                return value.replace(/(["'])/g, "\\$1");
            }
        },
        variation: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        pockets: {
            type: DataTypes.STRING(128),
            allowNull: false,
            get() {
                var val = this.getDataValue('pockets');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('pockets', val);
            }
        },
        clime: {
            type: DataTypes.STRING(20),
            allowNull: false,
            get() {
                var val = this.getDataValue('clime');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('clime', val);
            }
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        textures: {
            type: DataTypes.STRING(128),
            allowNull: false,
            get() {
                var val = this.getDataValue('textures');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('textures', val);
            }
        },
        sex: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
        },
        torso: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        undershirt: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        uTextures: {
            type: DataTypes.STRING(128),
            allowNull: false,
            get() {
                var val = this.getDataValue('uTextures');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('uTextures', val);
            }
        },
        class: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false,
        }
    }, {
        timestamps: false
    });

    return model;
};
