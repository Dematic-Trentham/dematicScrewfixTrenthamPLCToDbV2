//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 2
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:21:16
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import { readAndInsertMultiple } from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.21",
	rack: 0,
	slot: 3,
	name: "PLC2",
};

export async function readEMSDataFromPLC2() {
	const items = [
		{
			name: "EMS1_Zone1->PLC2",
			location: "PLC2",
			subLocation: "PLC2",
			description: "EStop Monitoring Zone 1",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 5,
			bit: 0,
		},
		{
			name: "PLC2_Zone1->EMS1_Zone1",
			location: "PLC2",
			subLocation: "PLC2",
			description: "EStop Monitoring Zone 1",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 4,
			bit: 5,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC2 };
