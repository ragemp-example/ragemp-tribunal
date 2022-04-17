module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("WorldObject", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        region: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        pos: {
            type: DataTypes.STRING(128),
            allowNull: false,
            get() {
                var val = this.getDataValue('pos');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);

                this.setDataValue('pos', val);
            }
        },
        radius: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        hash: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true,
            set(val) {
                if (!val) val = null;

                this.setDataValue('hash', val);
            },
        },
    }, {
        timestamps: false
    });

    model.associate = (models) => {

    };

    return model;
};
