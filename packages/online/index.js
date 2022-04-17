const {QueryTypes} = require('sequelize');

module.exports = {
    init() {
        inited(__dirname);
    },
    async getTopOnlinePlayers(period, limit) {
        return await db.sequelize.query(
            `SELECT pv.characterId, c.name, SUM(pv.minutes) as total
             FROM PlayersView pv
                      JOIN Characters c ON pv.characterId = c.id
             WHERE TO_DAYS(NOW()) - TO_DAYS(pv.date) <= :period
             GROUP BY pv.characterId
             ORDER BY SUM(pv.minutes) DESC LIMIT :limit`,
            {
                replacements: { period: period, limit: limit },
                type: QueryTypes.SELECT
            }
        )
    }
}