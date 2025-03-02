//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 21
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:00:15
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.23",
	rack: 0,
	slot: 2,
	name: "PLC21",
};

export async function readEMSDataFromPLC21() {
	const items = [
		{
			name: "PLC21_EEStopZone_Zone21.1",
			location: "PLC21",
			subLocation: "PLC21",
			description: "EStop Monitoring Zone 21.1 - First Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC21_EEStopZone_Zone21.2",
			location: "PLC21",
			subLocation: "PLC21",
			description: "EStop Monitoring Zone 21.2 - Second Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC21_EEStopZone_Zone21.3",
			location: "PLC21",
			subLocation: "PLC21",
			description: "EStop Monitoring Zone 21.3 - Third Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC21_EEStopZone_Zone21.4",
			location: "PLC21",
			subLocation: "PLC21",
			description: "EStop Monitoring Zone 21.4 - Fourth Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC21 };
