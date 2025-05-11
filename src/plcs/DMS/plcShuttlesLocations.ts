//Service for Dematic Dashboard Screwfix trentham to read date from Multishuttle aisles
//Created by: JWL
//Date: 2023/02/03 05:21:36
//Last modified: 2024/09/12 17:00:22
//Version: 0.0.1

import snap7 from "node-snap7";
const s7client = new snap7.S7Client();

//import types
import db from "../../db/db.js";
import { getParameterFromDB } from "../../misc/getParameterFromDB.js";
import logger from "../../misc/logging.js";

//function to be called by the main program every 10 minutes
async function readShuttlesToDB() {
	//logger.error("Reading Shuttles to DB");

	//lets get the parameters from the database for the amount of aisles and levels
	const amountOfAislesResult = await getParameterFromDB("dmsAmountOfAisles");
	const amountOfLevelsResult = await getParameterFromDB("dmsAmountOfLevels");
	const aisleBaseIPResult = await getParameterFromDB("dmsAisleBaseIP");
	const aisleIPOffsetResult = await getParameterFromDB("dmsAisleIPOffset");
	const aisleBaseLocationDBResult = await getParameterFromDB(
		"aisleBaseLocationDB"
	);

	const amountOfAisles = parseInt(amountOfAislesResult);
	const amountOfLevels = parseInt(amountOfLevelsResult);
	const aisleIPoffset = parseInt(aisleIPOffsetResult);
	const aisleBaseIP = aisleBaseIPResult;
	const aisleBaseLocationDB = parseInt(aisleBaseLocationDBResult);

	for (let aisle = 1; aisle < amountOfAisles + 1; aisle++) {
		//logger.error(aisle);
		//Loop through the 3 aisles
		await GetAisle(
			aisle,
			amountOfLevels,
			aisleBaseIP,
			aisleIPoffset,
			aisleBaseLocationDB
		);
	}

	// logger.error("Finished reading shuttles");
	return true;
}

async function GetAisle(
	aisle: number,
	amountOfLevels: number,
	aisleBaseIP: string,
	aisleIPOffset: number,
	aisleBaseLocationDB: number
) {
	for (let level = 1; level < amountOfLevels + 1; level++) {
		try {
			const dataMac = await getShuttleData(
				aisle,
				level,
				aisleBaseIP,
				aisleIPOffset,
				aisleBaseLocationDB
			);

			// logger.error("Aisle: " + dataMac.aisle + " Level: " + dataMac.level + " Mac: " + dataMac.mac);

			const timeStamp = new Date().toISOString();

			//before we update the database, check if that location is in use
			//update the shuttle locations table NEW
			const oldShuttleInLocation = await db.dmsShuttleLocations.findFirst({
				where: {
					currentLocation: `MSAI${paddy(dataMac.aisle, 2)}LV${paddy(dataMac.level, 2)}SH01`,
				},
			});

			//update the mac address with the new location, we may need to create a new record if the macAddress is not in the table
			const newShuttleInLocation = await db.dmsShuttleLocations.upsert({
				where: {
					macAddress: dataMac.mac,
				},
				create: {
					macAddress: dataMac.mac,
					shuttleID: "Unknown " + dataMac.mac,
					currentLocation: `MSAI${paddy(dataMac.aisle, 2)}LV${paddy(dataMac.level, 2)}SH01`,
					locationLastUpdated: timeStamp,
				},
				update: {
					currentLocation: `MSAI${paddy(dataMac.aisle, 2)}LV${paddy(dataMac.level, 2)}SH01`,
					locationLastUpdated: timeStamp,
				},
			});

			//if the old shuttle and the new shuttle are different,
			if (
				oldShuttleInLocation &&
				oldShuttleInLocation.macAddress !== newShuttleInLocation.macAddress
			) {
				//we need to update the old shuttle location
				await db.dmsShuttleLocations.update({
					where: {
						macAddress: oldShuttleInLocation.macAddress,
					},
					data: {
						currentLocation: "",
						locationLastUpdated: timeStamp,
					},
				});

				//create log entry for swaps
				await db.dmsShuttleSwapLogs.create({
					data: {
						timestamp: timeStamp,
						aisle: aisle,
						level: level,
						oldMacAddress: oldShuttleInLocation.macAddress,
						newMacAddress: newShuttleInLocation.macAddress,
						oldShuttleID: oldShuttleInLocation.shuttleID,
						newShuttleID: newShuttleInLocation.shuttleID,
					},
				});
			}
		} catch (err) {
			logger.error("Error reading shuttle data");
			logger.error("Aisle: " + aisle + " Level: " + level);
			logger.error(err);
		}
	}
}

function getShuttleData(
	aisle: number,
	level: number,
	baseIP: string,
	ipOffset: number,
	aisleBaseLocationDB: number
) {
	return new Promise<any>(function (resolve, reject) {
		s7client.ConnectTo(baseIP + (ipOffset + aisle), 0, 1, async function (err) {
			if (err) reject(s7client.ErrorText(err));

			//Loop through the levels

			s7client.ReadArea(
				0x84,
				aisleBaseLocationDB + level,
				1528,
				8,
				0x02,
				function (err, data) {
					if (err) reject(s7client.ErrorText(err));

					const tempArray = {
						aisle: aisle,
						level: level,
						mac: stringToCapital(toHexString(data)),
					};
					resolve(tempArray);
				}
			);
		});

		//return promise;
	});
}

function stringToCapital(string: string) {
	return string.toUpperCase();
}

function toHexString(byteArray: Buffer) {
	if (byteArray == null || byteArray.length == 0) return "";
	if (byteArray.length == 0) return "";

	return Array.from(byteArray, function (byte) {
		return ("0" + (byte & 0xff).toString(16)).slice(-2);
	}).join(" ");
}
function paddy(n: string, p: number, c?: undefined) {
	const pad_char = typeof c !== "undefined" ? c : "0";
	const pad = new Array(1 + p).join(pad_char);
	return (pad + n).slice(-pad.length);
}

export default { readShuttlesToDB };
