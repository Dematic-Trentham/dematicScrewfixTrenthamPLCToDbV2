//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 12
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 09:56:52
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.30",
	rack: 0,
	slot: 2,
	name: "PLC12",
};

export async function readEMSDataFromPLC12() {
	const items = [
		{
			name: "PLC12_EEStopZone_Zone4",
			location: "PLC12",
			subLocation: "PLC12",
			description: "EStop Monitoring Zone 4",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC12_EEStopZone_Zone12.1",
			location: "PLC12",
			subLocation: "PLC12",
			description: "EStop Monitoring Zone 12.1 - First Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC12_EEStopZone_Zone12.2",
			location: "PLC12",
			subLocation: "PLC12",
			description: "EStop Monitoring Zone 12.2 - Second Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC12_EEStopZone_Zone12.3",
			location: "PLC12",
			subLocation: "PLC12",
			description: "EStop Monitoring Zone 12.3 - Third Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
		{
			name: "PLC12_EEStopZone_Zone12.4",
			location: "PLC12",
			subLocation: "PLC12",
			description: "EStop Monitoring Zone 12.4 - Fourth Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 4,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC12 };
