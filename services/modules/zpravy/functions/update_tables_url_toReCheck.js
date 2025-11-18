const postgres_service = global.pathFinderOfService("postgres_service");
const config = require("../../../../config/config.js");

module.exports = function update_tables_url_toReCheck(tableName, reCheck) {
	//if(config.DEV_IS_DEV_MODE_ON === "TRUE") return;

	for(const urlLine of reCheck) {
		postgres_service.pg_db_client.query({
			text: `
				INSERT INTO zpravy (redakce, url)
				VALUES ($1, $2)
				ON CONFLICT (redakce) DO UPDATE
				SET url = array_append(zpravy.url, $3);
			`,
			values: [
				tableName,
				reCheck,
				urlLine
			],
		}).catch(e => console.error(e))
	};
}