//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 11
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 09:53:18
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.22",
	rack: 0,
	slot: 2,
	name: "PLC11",
};

export async function readEMSDataFromPLC11() {
	const items = [
		{
			name: "PLC11_EEStopZone_Zone4",
			location: "PLC11",
			subLocation: "PLC11",
			description: "EStop Monitoring Zone 4",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC11_EEStopZone_Zone11.1",
			location: "PLC11",
			subLocation: "PLC11",
			description: "EStop Monitoring Zone 11.1 - First Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC11_EEStopZone_Zone11.2",
			location: "PLC11",
			subLocation: "PLC11",
			description: "EStop Monitoring Zone 11.2 - Second Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC11_EEStopZone_Zone11.3",
			location: "PLC11",
			subLocation: "PLC11",
			description: "EStop Monitoring Zone 11.3 - Third Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
		{
			name: "PLC11_EEStopZone_Zone11.4",
			location: "PLC11",
			subLocation: "PLC11",
			description: "EStop Monitoring Zone 11.4 - Fourth Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 4,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC11 };
