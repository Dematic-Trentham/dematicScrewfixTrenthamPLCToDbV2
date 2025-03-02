//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 13
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:16:24
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.31",
	rack: 0,
	slot: 2,
	name: "PLC13",
};

export async function readEMSDataFromPLC13() {
	const items = [
		{
			name: "PLC13_EStopZone_Z5_ESTOP_OK_SEND_PL13_Z5",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 5 ESTOP_OK_SEND_PL13_Z5 ( Virtual )",
			area: snap7Types.Area.S7AreaDB,
			db: 300,
			start: 2,
			bit: 3,
		},
		{
			name: "PLC13_EStopZone_Z5_ES_EMZ05",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 5 ES_EMZ05 ( ASi Input )",
			area: snap7Types.Area.S7AreaPE,
			db: 0,
			start: 1901,
			bit: 0,
		},
		{
			name: "PLC13_EEStopZone_Zone5",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 5 ES_EMZ05 ( ASi Input )",
			area: snap7Types.Area.S7AreaPE,
			db: 0,
			start: 70,
			bit: 5,
		},
		{
			name: "PLC13_EEStopZone_Zone13.1",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 13.1 - First Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 0,
		},
		{
			name: "PLC13_EEStopZone_Zone13.2",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 13.2 - Second Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
		{
			name: "PLC13_EEStopZone_Zone13.3",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 13.3 - Third Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 2,
		},
		{
			name: "PLC13_EEStopZone_Zone13.4",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 13.4 - Fourth Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
		{
			name: "PLC13_EEStopZone_Zone4",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 4",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 4,
		},
		{
			name: "PLC13_EEStopZone_Zone5",
			location: "PLC13",
			subLocation: "PLC13",
			description: "EStop Monitoring Zone 5",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 1,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC13 };
