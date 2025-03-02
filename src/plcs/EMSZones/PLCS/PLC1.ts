//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 1
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:29:35
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.20",
	rack: 0,
	slot: 2,
	name: "PLC1",
};

export async function readEMSDataFromPLC1() {
	const items = [
		{
			name: "PLC1_EEStopZone_Zone2",
			location: "PLC1",
			subLocation: "PLC1",
			description: "EStop Monitoring Zone 2",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 5,
			bit: 0,
		},
	];

	console.log("Reading PLC1 EMS data");

	await readAndInsertMultiple(plcConfig, items);

	console.log("PLC1 EMS data read");
}

export default { readEMSDataFromPLC1 };
