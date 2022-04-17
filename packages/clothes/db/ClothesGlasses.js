module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("ClothesGlasses", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
            // get() {
            //     var value = this.getDataValue('name');
            //     value = value.replace(/(\\)/g, "");
            //     return value.replace(/(["'])/g, "\\$1");
            // }
        },
        variation: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
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
