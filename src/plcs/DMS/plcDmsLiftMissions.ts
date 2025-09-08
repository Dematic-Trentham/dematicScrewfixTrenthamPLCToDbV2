import logger from "../../misc/logging.js";
import db from "../../db/db.js";
import { getParameterFromDB } from "../../misc/getParameterFromDB.js";
import plc from "../../misc/plc/plc.js";

export async function plcDmsLiftMissionsHourly() {
	const amountOfAislesResult = await getParameterFromDB("dmsAmountOfAisles");
	const amountOfLiftsResult = await getParameterFromDB("dmsAmountOfLifts");
	const aisleBaseIPResult = await getParameterFromDB("dmsAisleBaseIP");
	const aisleIPOffsetResult = await getParameterFromDB("dmsAisleIPOffset");

	const amountOfAisles = parseInt(amountOfAislesResult);
	const amountOfLifts = parseInt(amountOfLiftsResult);
	const aisleIPoffset = parseInt(aisleIPOffsetResult);
	const aisleBaseIP = aisleBaseIPResult;

	for (let aisle = 1; aisle < amountOfAisles + 1; aisle++) {
		await GetAisleLifts(aisle, amountOfLifts, aisleBaseIP, aisleIPoffset);
	}
}

async function GetAisleLifts(
	aisle: number,
	amountOfLifts: number,
	aisleBaseIP: string,
	aisleIPOffset: number
) {
	for (let lift = 1; lift < amountOfLifts + 1; lift++) {
		const ip =
			aisleBaseIP.toString() +
			(aisleIPOffset + aisle).toString().padStart(3, "0");

		//db offset for lift 1 is 510, lift 2 is 514, lift 3 is 518 etc (4 apart)
		const makerOffset = 510 + (lift - 1) * 4;

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
			timestamp.setMinutes(0, 0, 0); // round down to the hour
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
		} catch (error) {
			logger.error(
				`Error processing aisle ${aisle}, lift ${lift} at IP ${ip}:`,
				error
			);
		}
	}
}
