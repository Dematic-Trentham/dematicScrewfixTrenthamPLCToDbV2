//Service for Dematic Dashboard Screwfix trentham to read ems Data from PLC 33
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 09:12:12
//Version: 0.0.1
import snap7Types from "../../../misc/plc/types.js";
import {
	readAndInsertMultiple,
	readAndInsertSingle,
} from "../functions/updateDB.js";

const plcConfig = {
	ip: "10.4.2.32",
	rack: 0,
	slot: 2,
	name: "PLC33",
};

export async function readEMSDataFromPLC33() {
	const items = [
		{
			name: "PLC33_EStopZone_Z5",
			location: "PLC33",
			subLocation: "PLC33",
			description: "EStop Monitoring Zone 5 ( Virtual )",
			area: snap7Types.Area.S7AreaDB,
			db: 328,
			start: 6,
			bit: 1,
		},
		{
			name: "PLC33_EStopZone_Z5_EM_BUTTONS_Z5",
			location: "PLC33",
			subLocation: "PLC33",
			description: "EStop Monitoring Zone 5 - Block Input ( Virtual )",
			area: snap7Types.Area.S7AreaDB,
			db: 300,
			start: 1,
			bit: 4,
		},
		{
			name: "PLC33_EStopZone_Z5_ESTOP_OK_RCV_PLC13_Z5",
			location: "PLC33",
			subLocation: "PLC33",
			description:
				"EStop Monitoring Zone 5 - ESTOP_OK_RCV_PLC13_Z5 ( Virtual )",
			area: snap7Types.Area.S7AreaDB,
			db: 300,
			start: 3,
			bit: 7,
		},
		{
			name: "PLC33_EStopZone_Z5_SI_33BB2_EM",
			location: "PLC33",
			subLocation: "PLC33",
			description: "EStop Monitoring Zone 5 - SI_33BB2_EM ( ASI Stop )",
			area: snap7Types.Area.S7AreaPE,
			db: 0,
			start: 3046,
			bit: 4,
		},
		{
			name: "PLC33_EStopZone_Z5_SI_33BC4_EM",
			location: "PLC33",
			subLocation: "PLC33",
			description: "EStop Monitoring Zone 5 - SI_33BC4_EM ( ASI Stop )",
			area: snap7Types.Area.S7AreaPE,
			db: 0,
			start: 3046,
			bit: 5,
		},
		{
			name: "PLC33_EStopZone_33ZCA01_B",
			location: "PLC33",
			subLocation: "PLC33",
			description: "33ZCA01_B",
			area: snap7Types.Area.S7AreaPE,
			db: 0,
			start: 3040,
			bit: 2,
		},
		{
			name: "PLC33_EStopZone_Zone4",
			location: "PLC33",
			subLocation: "PLC33",
			description: "Emergency Stop Relay Healthy Zone 4 - Floor 1",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 3,
		},
		{
			name: "PLC33_EStopZone_Zone4_1",
			location: "PLC33",
			subLocation: "PLC33",
			description: "Emergency Stop Relay Healthy Zone 4-1 Mezz above PLC33",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 7,
		},
		{
			name: "PLC33_EStopZone_Zone5",
			location: "PLC33",
			subLocation: "PLC33",
			description: "Emergency Stop Relay Healthy Zone 5",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 4,
		},
		{
			name: "PLC33_EStopZone_Zone6",
			location: "PLC33",
			subLocation: "PLC33",
			description: "Emergency Stop Relay Healthy Zone 6 - Ground Floor",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 5,
		},
		{
			name: "PLC33_EStopZone_Zone7",
			location: "PLC33",
			subLocation: "PLC33",
			description: "Emergency Stop Relay Healthy Zone 7- Mezzanine",
			area: snap7Types.Area.S7AreaMK,
			db: 0,
			start: 70,
			bit: 6,
		},
	];

	await readAndInsertMultiple(plcConfig, items);
}

export default { readEMSDataFromPLC33 };
