module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Biz", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        /// Владелец
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        /// Ник владельца
        characterNick: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        /// Крыша бизнеса
        factionId: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1,
            allowNull: false
        },
        /// До какого числа бизнес оплачен
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        /// Название бизнеса
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        /// Стоимость бизнеса
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        /// Тип бизнеса
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        /// Сумма денег в кассе
        cashBox: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        /// Кол-во продуктов на складе
        productsCount: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        /// Вместимость склада
        productsMaxCount: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        /// Кол-во продуктов в заказе
        productsOrder: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        /// Стоимость всего заказа
        productsOrderPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        /// Координаты точки бизнеса
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }, { timestamps: false });

    model.associate = (models) => {
        model.belongsTo(models.Character, {
            foreignKey: "characterId"
        });
        model.belongsTo(models.Faction, {
            foreignKey: "factionId",
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT",
        });

        model.hasMany(models.BizStatistics, {
            foreignKey: "bizId"
        });
    };

    return model;
};
