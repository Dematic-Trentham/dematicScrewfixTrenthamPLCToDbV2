type autoCartonMachineType = "erector" | "Lidder" | "iPack";
import db from "../../db/db.js";

import logger from "../../misc/logging.js";

export async function addFaultsToDB(
	machineType: autoCartonMachineType,
	fault: string,
	line: number
) {
	logger.info(`Adding fault to DB: ${machineType} ${fault} LINE ${line}`);

	//is there already a faultcode in the database for this fault
	const faultCodes = await db.autoCartonFaultCodeLookup.findFirst({
		where: {
			faultMessage: fault,
		},
	});

	// if there is a fault code then insert the fault code into the DB
	let faultCodeID = 0;

	if (faultCodes) {
		//	logger.info("Fault code already exists in DB: ", faultCodes.ID);

		faultCodeID = faultCodes.ID;
	} else {
		//insert fault code into DB
		const faultCode = await db.autoCartonFaultCodeLookup.create({
			data: {
				faultMessage: fault,
			},
		});

		//	logger.info("Fault code created in DB: ", faultCode.ID);

		faultCodeID = faultCode.ID;
	}

	//insert fault into DB
	await db.autoCartonFaults.create({
		data: {
			timestamp: new Date(),
			machineType: machineType,
			line: line,
			faultCode: faultCodeID,
		},
	});
}
