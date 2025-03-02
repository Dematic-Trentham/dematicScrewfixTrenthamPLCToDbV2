//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 24
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:04:45
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.26",
	rack: 0,
	slot: 2,
	name: "PLC24",
};

export async function readEMSDataFromPLC24() {
	const items = [
		{
			name: "PLC24_EEStopZone_Zone24.1",
			location: "PLC24",
			subLocation: "PLC24",
			description: "EStop Monitoring Zone 24.1 - First Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC24_EEStopZone_Zone24.2",
			location: "PLC24",
			subLocation: "PLC24",
			description: "EStop Monitoring Zone 24.2 - Second Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC24_EEStopZone_Zone24.3",
			location: "PLC24",
			subLocation: "PLC24",
			description: "EStop Monitoring Zone 24.3 - Third Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC24_EEStopZone_Zone24.4",
			location: "PLC24",
			subLocation: "PLC24",
			description: "EStop Monitoring Zone 24.4 - Fourth Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC24 };
