//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 23
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:04:03
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.25",
	rack: 0,
	slot: 2,
	name: "PLC23",
};

export async function readEMSDataFromPLC23() {
	const items = [
		{
			name: "PLC23_EEStopZone_Zone23.1",
			location: "PLC23",
			subLocation: "PLC23",
			description: "EStop Monitoring Zone 23.1 - First Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC23_EEStopZone_Zone23.2",
			location: "PLC23",
			subLocation: "PLC23",
			description: "EStop Monitoring Zone 23.2 - Second Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC23_EEStopZone_Zone23.3",
			location: "PLC23",
			subLocation: "PLC23",
			description: "EStop Monitoring Zone 23.3 - Third Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC23_EEStopZone_Zone23.4",
			location: "PLC23",
			subLocation: "PLC23",
			description: "EStop Monitoring Zone 23.4 - Fourth Floor)",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC23 };
