module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define("VehicleTuning", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        vehicleId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        spoiler: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        frontBumper: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        rearBumper: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        sideSkirt: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        exhaust: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        frame: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        grille: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        hood: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        fender: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        rightFender: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        roof: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        engineType: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        brakeType: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        transmissionType: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        horn: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        suspensionType: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        armourType: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        turbo: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        xenon: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        frontWheels: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        backWheels: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        plateHolder: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        trimDesign: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        ornament: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        dialDesign: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        steeringWheel: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        shiftLever: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        plaque: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        hydraulics: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        boost: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        windowTint: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        livery: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        plate: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
        neon: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            allowNull: false
        },
    }, { timestamps: false });

    // model.associate = (models) => {
    //     model.belongsTo(models.Vehicle, {
    //         foreignKey: "vehicleId"
    //     });
    // };

    return model;
};
