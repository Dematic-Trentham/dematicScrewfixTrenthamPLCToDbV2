//Service for Dematic Dashboard Screwfix trentham to read data from PLC and convert to DB
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/09/16 23:22:00
//Version: 0.0.1

//import plc
import plc from "./plc/plc.js";
import snap7Types from "./plc/types.js";

import DB from "../db/db.js";
import logger from "./logging.js";

//function to read data from PLC and convert to DB
async function plcToDB(
	ip: string,
	rack: number,
	slot: number,
	area: number,
	db: number,
	offset: number,
	type: number,
	dbName: string
) {
	switch (area) {
		case snap7Types.Area.S7AreaDB:
			//read data from PLC
			await plc
				.readFromS7DBToInt(ip, rack, slot, db, offset, type)
				.then(async (result) => {
					// Check if the entry exists
					const existingEntry = await DB.siteParameters.findUnique({
						where: {
							name: dbName,
						},
					});

					if (existingEntry) {
						// Update the existing entry
						await DB.siteParameters.update({
							where: {
								name: dbName,
							},
							data: {
								value: result.toString(),
								lastUpdated: new Date(),
							},
						});
					} else {
						// Create a new entry
						await DB.siteParameters.create({
							data: {
								name: dbName,
								value: result.toString(),
								lastUpdated: new Date(),
								description: "",
								location: "",
							},
						});
					}
				})
				.catch((err) => {
					logger.error("plcToDB 1 " + err);
				});

			break;
		case snap7Types.Area.S7AreaMK:
			//read data from PLC
			await plc
				.readFromMarkerBit(ip, rack, slot, db, offset)

				.then(async (result) => {
					//sql query to insert data into DB

					// Check if the entry exists
					const existingEntry = await DB.siteParameters.findUnique({
						where: {
							name: dbName,
						},
					});

					if (existingEntry) {
						// Update the existing entry
						await DB.siteParameters.update({
							where: {
								name: dbName,
							},
							data: {
								value: result.toString(),
								lastUpdated: new Date(),
							},
						});
					} else {
						// Create a new entry
						await DB.siteParameters.create({
							data: {
								name: dbName,
								value: result.toString(),
								lastUpdated: new Date(),
								description: "",
								location: "",
							},
						});
					}
				})
				.catch((err) => {
					logger.error("plcToDB 2 " + err);
				});

			break;

		default:
			logger.error("plcToDB 3 " + "bad area");
			break;
	}
}

//export function
export default { plcToDB, DataType: plc.DataType };
