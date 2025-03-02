//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 22
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:04:01
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.24",
	rack: 0,
	slot: 2,
	name: "PLC22",
};

export async function readEMSDataFromPLC22() {
	const items = [
		{
			name: "PLC22_EEStopZone_Zone22.1",
			location: "PLC22",
			subLocation: "PLC22",
			description: "EStop Monitoring Zone 22.1 - First Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC22_EEStopZone_Zone22.2",
			location: "PLC22",
			subLocation: "PLC22",
			description: "EStop Monitoring Zone 22.2 - Second Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC22_EEStopZone_Zone22.3",
			location: "PLC22",
			subLocation: "PLC22",
			description: "EStop Monitoring Zone 22.3 - Third Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC22_EEStopZone_Zone22.4",
			location: "PLC22",
			subLocation: "PLC22",
			description: "EStop Monitoring Zone 22.4 - Fourth Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC22 };
