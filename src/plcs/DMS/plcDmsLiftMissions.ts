import logger from "../../misc/logging.js";
import db from "../../db/db.js";
import { getParameterFromDB } from "../../misc/getParameterFromDB.js";
import plc from "../../misc/plc/plc.js";

export async function plcDmsLiftMissions() {
	logger.info("Starting plcDmsLiftMissionsHourly...");

	const amountOfAislesResult = await getParameterFromDB(
		"dmsAmountOfAisles",
		"This is the Amount of Aisles in the DMS, used for reading the shuttle counts from the PLC.",
		"3"
	);
	const amountOfLiftsResult = await getParameterFromDB(
		"dmsAmountOfLifts",
		"This is the Amount of Lifts in the DMS, used for reading the shuttle counts from the PLC.",
		"4"
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

	const amountOfAisles = parseInt(amountOfAislesResult);
	const amountOfLifts = parseInt(amountOfLiftsResult);
	const aisleIPoffset = parseInt(aisleIPOffsetResult);
	const aisleBaseIP = aisleBaseIPResult;

	for (let aisle = 1; aisle < amountOfAisles + 1; aisle++) {
		await GetAisleLifts(aisle, amountOfLifts, aisleBaseIP, aisleIPoffset);
	}

	logger.info("Finished plcDmsLiftMissionsHourly.");
}

async function GetAisleLifts(
	aisle: number,
	amountOfLifts: number,
	aisleBaseIP: string,
	aisleIPOffset: number
) {
	for (let lift = 1; lift < amountOfLifts + 1; lift++) {
		await getAliseLift(aisleBaseIP, aisleIPOffset, aisle, lift);
	}
}
async function getAliseLift(
	aisleBaseIP: string,
	aisleIPOffset: number,
	aisle: number,
	lift: number
) {
	const ip =
		aisleBaseIP.toString() +
		(aisleIPOffset + aisle).toString().padStart(3, "0");

	//db offset for lift 1 is 510, lift 2 is 514, lift 3 is 518 etc (4 apart)
	const makerOffset = 510 + (lift - 1) * 4;

	let attempts = 0;
	const maxAttempts = 3;
	while (attempts < maxAttempts) {
		try {
			const liftMissionAmountRAW = await plc.readFromS7Markers(
				ip,
				0,
				1,
				makerOffset,
				100
			); // Mission number

			const liftMissionAmount =
				typeof liftMissionAmountRAW === "number"
					? liftMissionAmountRAW
					: liftMissionAmountRAW.readUInt32BE
						? liftMissionAmountRAW.readUInt32BE(0)
						: parseInt(liftMissionAmountRAW.toString());

			const timestamp = new Date();
			timestamp.setMinutes(Math.floor(timestamp.getMinutes() / 10) * 10, 0, 0); // round down to the 10 minutes
			timestamp.setSeconds(0, 0);
			timestamp.setMilliseconds(0);

			await db.dMSLiftMovements.create({
				data: {
					timestamp,
					aisle,
					liftNumber: lift,
					totalAtTime: liftMissionAmount,
				},
			});
			break; // Success, exit loop
		} catch (error) {
			attempts++;
			logger.error(
				`Error processing aisle ${aisle}, lift ${lift} at IP ${ip}, attempt ${attempts}:`,
				error
			);
			if (attempts < maxAttempts) {
				await new Promise((res) => setTimeout(res, 5000));
			}
		}
	}
}
