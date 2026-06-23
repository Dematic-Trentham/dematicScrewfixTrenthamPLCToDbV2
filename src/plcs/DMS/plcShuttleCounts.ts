import { getParameterFromDB } from "../../misc/getParameterFromDB.js";
import plc from "../../misc/plc/plc.js";
import db from "../../db/db.js";
import logger from "../../misc/logging.js";
import {
	readShuttleStatsFromBuffer,
	T_ShuttleStats,
} from "./plcShuttleStatsType.js";

import { Buffer } from "node:buffer";

import fs from "fs";

const lastShuttleCounts: {
	[aisle: number]: {
		[level: number]: { picks: number; drops: number; iat: number };
	};
} = {};

//this function reads the shuttle counts from the PLC and writes them to the database every 5 minutes.
async function readShuttlesCounts() {
	//get the amount of aisles from the database
	const amountOfAislesResult = await getParameterFromDB(
		"dmsAmountOfAisles",
		"This is the Amount of Aisles in the DMS, used for reading the shuttle counts from the PLC.",
		"3"
	);
	const amountOfLevelsResult = await getParameterFromDB(
		"dmsAmountOfLevels",
		"This is the Amount of Levels in the DMS, used for reading the shuttle counts from the PLC.",
		"25"
	);
	const aisleBaseIPResult = await getParameterFromDB(
		"dmsAisleBaseIP",
		"This is the Base IP for the DMS aisles, used for reading the shuttle counts from the PLC.",
		"10.4.2."
	);
	const aisleIPOffsetResult = await getParameterFromDB(
		"dmsAisleIPOffset",
		"This is the IP Offset for the DMS aisles, used for reading the shuttle counts from the PLC.",
		"100"
	);
	const dmsAisleStatsDBResult = await getParameterFromDB(
		"dmsAisleStatsDB",
		"This is the Database for the DMS aisle stats, used for reading the shuttle counts from the PLC.",
		"833"
	);

	const amountOfAisles = parseInt(amountOfAislesResult);
	const amountOfLevels = parseInt(amountOfLevelsResult);
	const aisleBaseIP = aisleBaseIPResult;
	const aisleIPoffset = parseInt(aisleIPOffsetResult);
	const dmsAisleStatsDB = parseInt(dmsAisleStatsDBResult);

	for (let aisle = 1; aisle < amountOfAisles + 1; aisle++) {
		//Loop through the aisles
		await getShuttleCountsAisle(
			aisle,
			amountOfLevels,
			aisleBaseIP,
			aisleIPoffset,
			2402
		);
	}
}

async function getShuttleCountsAisle(
	aisle: number,
	amountOfLevels: number,
	aisleBaseIP: string,
	aisleIPoffset: number,
	dmsAisleStatsDB: number
) {
	// for (let level = 1; level < amountOfLevels + 1; level++) {
	// 	//Loop through the levels
	// 	await getShuttleCountsLevel(
	// 		aisle,
	// 		level,
	// 		aisleBaseIP,
	// 		aisleIPoffset,
	// 		dmsAisleStatsDB
	// 	);
	// }

	await getShuttleCountsAllLevels(
		aisle,
		amountOfLevels,
		aisleBaseIP,
		aisleIPoffset,
		dmsAisleStatsDB
	);
}

async function getShuttleCountsAllLevels(
	aisle: number,
	amountOfLevels: number,
	aisleBaseIP: string,
	aisleIPoffset: number,
	dmsCnvStatDB: number
) {
	const ip = aisleBaseIP + (aisleIPoffset + aisle).toString();

	try {
		const buffer = await plc.readFromS7DbRAW(ip, 0, 1, dmsCnvStatDB, 0, 19558);

		//write the buffer to a file for debugging
		//fs.writeFileSync(`./shuttleCountsAisle${aisle}.bin`, buffer);

		//infeed 1 level 1 is at 1112, level 2 at 1122 , level 25 at 1352
		//infeed 2 level 1 is at 1512, level 2 at 1522 , level 25 at 1752

		//outfeed 1 level 1 is at 1114, level 2 at 1124 , level 25 at 1354
		//outfeed 2 level 1 is at 1116, level 2 at 1126 , level 25 at 1356

		//get the shuttle in the database for this aisle and level
		const shuttleInDB = await db.dmsShuttleLocations.findMany({});

		const latestGroups = await db.dmsShuttleMissions.groupBy({
			by: ["aisle", "level"],
			_max: {
				timeStamp: true,
			},
		});

		const latestRows = await Promise.all(
			latestGroups.map((group) =>
				db.dmsShuttleMissions.findFirst({
					where: {
						aisle: group.aisle,
						level: group.level,
						timeStamp: group._max.timeStamp!,
					},
				})
			)
		);
		//console.log(`Latest shuttle mission records for aisle ${aisle}:`);
		//console.log(latestRows);
		//console.log(latestRows.length);
		//process.exit(0);

		for (let level = 1; level < amountOfLevels + 1; level++) {
			const startingByteInfeed1 = (1112 + (level - 1) * 10) * 22 - 1000 * 22; // Calculate the starting byte for the current level
			const startingByteInfeed2 = (1512 + (level - 1) * 10) * 22 - 1000 * 22; // Calculate the starting byte for the current level
			const startingByteOutfeed1 = (1114 + (level - 1) * 10) * 22 - 1000 * 22; // Calculate the starting byte for the current level
			const startingByteOutfeed2 = (1116 + (level - 1) * 10) * 22 - 1000 * 22; // Calculate the starting byte for the current level

			//read into shuttle stats object
			const infeed1 = await readShuttleStatsFromBufferLevel(
				buffer.slice(startingByteInfeed1, startingByteInfeed1 + 22)
			);

			const infeed2 = await readShuttleStatsFromBufferLevel(
				buffer.slice(startingByteInfeed2, startingByteInfeed2 + 22)
			);

			const outfeed1 = await readShuttleStatsFromBufferLevel(
				buffer.slice(startingByteOutfeed1, startingByteOutfeed1 + 22)
			);

			const outfeed2 = await readShuttleStatsFromBufferLevel(
				buffer.slice(startingByteOutfeed2, startingByteOutfeed2 + 22)
			);

			const totalPicks = infeed1.itemStarts + infeed2.itemStarts;
			const totalDrops = outfeed1.itemStarts + outfeed2.itemStarts;

			//cacluate the current Level
			const currentLocation = `MSAI${aisle.toString().padStart(2, "0")}LV${level.toString().padStart(2, "0")}SH01`;

			//get the shuttle in the database for this aisle and level
			const shuttleAtLevelInDB = shuttleInDB.find(
				(shuttle) => shuttle.currentLocation === currentLocation
			);
			//	console.log(
			//	`Aisle ${aisle} Level ${level} - Picks: ${totalPicks}, Drops: ${totalDrops}, Shuttle ID: ${shuttleAtLevelInDB ? shuttleAtLevelInDB.shuttleID : "Unknown"}`
			//	);

			let latestRow: any = null;

			//get the delta
			if (latestRows.length > 0) {
				latestRow = latestRows.find(
					(row) => row?.aisle === aisle && row?.level === level
				);
			}

			// caculate the difference in counts since the last time we read the counts for this aisle and level, and write it to the database with a timestamp and the shuttle ID if we have it, if not write unknown as the shuttle ID
			const realPicks = latestRow ? totalPicks - latestRow.totalPicks : 0;
			const realDrops = latestRow ? totalDrops - latestRow.totalDrops : 0;

			//lets create a new record in the Shuttle missions table with the shuttle stats and the shuttle location from the database
			await db.dmsShuttleMissions.create({
				data: {
					aisle: aisle,
					level: level,
					shuttleID: shuttleAtLevelInDB
						? shuttleAtLevelInDB.shuttleID
						: "Unknown",
					totalPicks: realPicks,
					totalDrops: realDrops,
					timeRange: "hour",
					timeStamp: new Date(),
					runningPicks: totalPicks,
					runningDrops: totalDrops,
				},
			});
		}
	} catch (error) {
		logger.error(
			` :( Error reading shuttle counts from PLC at IP ${ip} for aisle ${aisle}: ${error}`
		);
	}
}

type ShuttleStats = {
	motorStarts: number;
	itemStarts: number;
	faultCount: number;
	hoursRun: number;
	minsRun: number;
	msRun: number;
};

async function readShuttleStatsFromBufferLevel(
	buffer: Buffer
): Promise<ShuttleStats> {
	//structure of the buffer is 22 bytes per level, 4- motorStarts, 4- itemStarts, 4-faultCount,4- hoursRun, 2- minsRun, 4- MsRun

	const statsObject: ShuttleStats = {
		motorStarts: buffer.readUInt32BE(0),
		itemStarts: buffer.readUInt32BE(4),
		faultCount: buffer.readUInt32BE(8),
		hoursRun: buffer.readUInt32BE(12),
		minsRun: buffer.readUInt16BE(16),
		msRun: buffer.readUInt32BE(18),
	};

	return statsObject;
}

async function getShuttleCountsLevel(
	aisle: number,
	level: number,
	aisleBaseIP: string,
	aisleIPoffset: number,
	dmsAisleStatsDB: number
) {
	const ip = aisleBaseIP + (aisleIPoffset + aisle).toString();
	try {
		//read from the PLC between offset 25146.0 and 25368.0 222 bytes) for the shuttle counts)
		//25368 - 25146 = 222

		const startingByte = 25146 + (level - 1) * 222; // Calculate the starting byte for the current level

		const buffer = await plc.readFromS7DbRAW(
			ip,
			0,
			1,
			dmsAisleStatsDB,
			startingByte,
			222
		);

		const tempShuttleStats = readShuttleStatsFromBuffer(buffer);

		//MSAI02LV22SH01
		const currentLocation = `MSAI${aisle.toString().padStart(2, "0")}LV${level.toString().padStart(2, "0")}SH01`;

		//get the shuttle in the database for this aisle and level
		const shuttleInDB = await db.dmsShuttleLocations.findFirst({
			where: {
				currentLocation: currentLocation,
			},
		});

		//do we have the last shuttle counts for this aisle and level? if not, create it with the current counts and an IAT of 0
		if (!lastShuttleCounts[aisle] || !lastShuttleCounts[aisle][level]) {
			if (!lastShuttleCounts[aisle]) {
				lastShuttleCounts[aisle] = {};
			}
			if (!lastShuttleCounts[aisle][level]) {
				lastShuttleCounts[aisle][level] = {
					picks: parseInt(String(tempShuttleStats.pick_missions.value || 0)),
					drops: parseInt(String(tempShuttleStats.drop_missions.value || 0)),
					iat: parseInt(String(tempShuttleStats.iat_missions.value || 0)),
				};
			}
		} else {
			const picks = parseInt(String(tempShuttleStats.pick_missions.value || 0));
			const drops = parseInt(String(tempShuttleStats.drop_missions.value || 0));
			const iat = parseInt(String(tempShuttleStats.iat_missions.value || 0));
			const realTotalKM = parseInt(
				String(tempShuttleStats.X_axis_distance_km.value || 0)
			);
			// caculate the difference in counts since the last time we read the counts for this aisle and level, and write it to the database with a timestamp and the shuttle ID if we have it, if not write unknown as the shuttle ID
			let realPicks = 0;
			let realDrops = 0;
			let realIATs = 0;

			if (picks >= lastShuttleCounts[aisle][level].picks) {
				realPicks = picks - lastShuttleCounts[aisle][level].picks;
			}

			if (drops >= lastShuttleCounts[aisle][level].drops) {
				realDrops = drops - lastShuttleCounts[aisle][level].drops;
			}

			if (iat >= lastShuttleCounts[aisle][level].iat) {
				realIATs = iat - lastShuttleCounts[aisle][level].iat;
			}

			//lets create a new record in the Shuttle missions table with the shuttle stats and the shuttle location from the database
			await db.dmsShuttleMissions.create({
				data: {
					aisle: aisle,
					level: level,
					shuttleID: shuttleInDB ? shuttleInDB.shuttleID : "Unknown",
					totalPicks: realPicks,
					totalDrops: realDrops,
					//totalIATs: realIATs,
					timeRange: "hour",
					timeStamp: new Date(),
					//realTotalKM: realTotalKM,
					runningPicks: 0,
					runningDrops: 0,
				},
			});

			//console.log(
			//	`Aisle ${aisle} Level ${level} - Picks: ${picks - lastShuttleCounts[aisle][level].picks}, Drops: ${
			//		drops - lastShuttleCounts[aisle][level].drops
			//	}, IATs: ${iat - lastShuttleCounts[aisle][level].iat}, Real Total KM: ${realTotalKM}`
			//);

			lastShuttleCounts[aisle][level] = {
				picks: parseInt(String(tempShuttleStats.pick_missions.value || 0)),
				drops: parseInt(String(tempShuttleStats.drop_missions.value || 0)),
				iat: parseInt(String(tempShuttleStats.iat_missions.value || 0)),
			};
		}

		if (aisle == 2 && level == 25) {
			logger.info(
				`\x1b[36mShuttle stats for aisle ${aisle} level ${level}: byte ${startingByte}\x1b[0m`
			);

			for (const key in tempShuttleStats) {
				const stat = tempShuttleStats[key as keyof T_ShuttleStats];
				logger.info(`\x1b[36m${stat.name}: ${stat.value}\x1b[0m`);
			}
		}
	} catch (error) {
		logger.error(
			`Error reading shuttle counts from PLC at IP ${ip} for aisle ${aisle} level ${level}: ${error}`
		);
		return;
	}
}

export default { readShuttlesCounts };
