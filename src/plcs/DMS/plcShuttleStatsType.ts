export type T_ShuttleStats = {
	power_seconds: PLC_Types;
	power_hours: PLC_Types;
	power_years: PLC_Types;
	power_years_real: PLC_Types;
	operating_seconds: PLC_Types;
	operating_hours: PLC_Types;
	operating_years: PLC_Types;
	fault_seconds: PLC_Types;
	fault_hours: PLC_Types;
	fault_years: PLC_Types;
	fault_years_real: PLC_Types;
	availability: PLC_Types;
	drop_missions: PLC_Types;
	pick_missions: PLC_Types;
	shuffle_missions: PLC_Types;
	iat_missions: PLC_Types;
	bypass_missions: PLC_Types;
	X_axis_operating_second: PLC_Types;
	X_axis_operating_hours: PLC_Types;
	X_axis_operating_years: PLC_Types;
	X_axis_distance_m: PLC_Types;
	X_axis_distance_km: PLC_Types;
	Z_axis_operating_seconds: PLC_Types;
	Z_axis_operating_hours: PLC_Types;
	Z_axis_operating_years: PLC_Types;
	Z_axis_distance_m: PLC_Types;
	Z_axis_distance_km: PLC_Types;
	Z2_axis_operating_sec: PLC_Types;
	Z2_axis_operating_hours: PLC_Types;
	Z2_axis_operating_years: PLC_Types;
	Z2_axis_distance_m: PLC_Types;
	Z2_axis_distance_km: PLC_Types;
	depth_1_pick_drop: PLC_Types;
	depth_2_pick_drop: PLC_Types;
	depth_3_pick_drop: PLC_Types;
	depth_4_pick_drop: PLC_Types;
	depth_5_pick_drop: PLC_Types;
	depth_6_pick_drop: PLC_Types;
	depth_7_pick_drop: PLC_Types;
	depth_8_pick_drop: PLC_Types;
	depth_9_pick_drop: PLC_Types;
	depth_10_pick_drop: PLC_Types;
	W_axis_operating_seconds: PLC_Types;
	W_axis_operating_hours: PLC_Types;
	W_axis_operating_years: PLC_Types;
	W_axis_distance_cm: PLC_Types;
	W_axis_distance_m: PLC_Types;
	W_axis_actions: PLC_Types;
	fp1_cycles: PLC_Types;
	fp2_cycles: PLC_Types;
	fp3_cycles: PLC_Types;
	fp4_cycles: PLC_Types;
	fault_count: PLC_Types;
	warning_count: PLC_Types;
	RESET_TIME: PLC_Types;
	RESET_DATE: PLC_Types;
};

export enum PLC_Data_Types {
	Int = 0,
	Dint = 1,
	Real = 2,
	TimeOfDay = 3,
	Date = 4,
}

export type PLC_Types = {
	name: string;
	startingByte: number;
	type: PLC_Data_Types;
	value?: number | string;
};

export function readShuttleStatsFromBuffer(buffer: Buffer): T_ShuttleStats {
	try {
		const shuttleStats: T_ShuttleStats = { ...T_ShuttleStats_Types };

		for (const key in shuttleStats) {
			const stat = shuttleStats[key as keyof T_ShuttleStats];
			const { startingByte, type } = stat;
			let value: number | string;

			try {
				switch (type) {
					case PLC_Data_Types.Int:
						value = buffer.readInt16BE(startingByte);
						break;
					case PLC_Data_Types.Dint:
						value = buffer.readInt32BE(startingByte);
						break;
					case PLC_Data_Types.Real:
						value = buffer.readFloatBE(startingByte);
						break;
					case PLC_Data_Types.TimeOfDay: {
						const totalSeconds = buffer.readInt32BE(startingByte);
						const hours = Math.floor(totalSeconds / 3600);
						const minutes = Math.floor((totalSeconds % 3600) / 60);
						const seconds = totalSeconds % 60;
						value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
						break;
					}
					case PLC_Data_Types.Date: {
						const daysSinceEpoch = buffer.readInt16BE(startingByte);
						const epoch = new Date(1970, 0, 1);
						const date = new Date(
							epoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000
						);
						value = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

						break;
					}
					default:
						value = 0;
				}
				shuttleStats[key as keyof T_ShuttleStats].value = value;
			} catch (error) {
				console.log(
					`Error reading ${stat.name} at byte ${startingByte} , buffer lenght ${buffer.length} with type ${PLC_Data_Types[type]}: ${error}`
				);
				shuttleStats[key as keyof T_ShuttleStats].value = 0; // Set a default value in case of error
			}
		}

		return shuttleStats;
	} catch (error) {
		console.log(`Error parsing shuttle stats from buffer: ${error}`);
		throw error;
	}
}

export const T_ShuttleStats_Types: T_ShuttleStats = {
	power_seconds: {
		name: "power_seconds",
		startingByte: 0,
		type: PLC_Data_Types.Dint,
	},
	power_hours: {
		name: "power_hours",
		startingByte: 4,
		type: PLC_Data_Types.Dint,
	},
	power_years: {
		name: "power_years",
		startingByte: 8,
		type: PLC_Data_Types.Dint,
	},
	power_years_real: {
		name: "power_years_real",
		startingByte: 12,
		type: PLC_Data_Types.Real,
	},
	operating_seconds: {
		name: "operating_seconds",
		startingByte: 16,
		type: PLC_Data_Types.Dint,
	},
	operating_hours: {
		name: "operating_hours",
		startingByte: 20,
		type: PLC_Data_Types.Dint,
	},
	operating_years: {
		name: "operating_years",
		startingByte: 24,
		type: PLC_Data_Types.Dint,
	},
	fault_seconds: {
		name: "fault_seconds",
		startingByte: 28,
		type: PLC_Data_Types.Dint,
	},
	fault_hours: {
		name: "fault_hours",
		startingByte: 32,
		type: PLC_Data_Types.Dint,
	},
	fault_years: {
		name: "fault_years",
		startingByte: 36,
		type: PLC_Data_Types.Dint,
	},
	fault_years_real: {
		name: "fault_years_real",
		startingByte: 40,
		type: PLC_Data_Types.Real,
	},
	availability: {
		name: "availability",
		startingByte: 44,
		type: PLC_Data_Types.Dint,
	},
	drop_missions: {
		name: "drop_missions",
		startingByte: 48,
		type: PLC_Data_Types.Dint,
	},
	pick_missions: {
		name: "pick_missions",
		startingByte: 52,
		type: PLC_Data_Types.Dint,
	},
	shuffle_missions: {
		name: "shuffle_missions",
		startingByte: 56,
		type: PLC_Data_Types.Dint,
	},
	iat_missions: {
		name: "iat_missions",
		startingByte: 60,
		type: PLC_Data_Types.Dint,
	},
	bypass_missions: {
		name: "bypass_missions",
		startingByte: 64,
		type: PLC_Data_Types.Dint,
	},
	X_axis_operating_second: {
		name: "X_axis_operating_second",
		startingByte: 68,
		type: PLC_Data_Types.Dint,
	},
	X_axis_operating_hours: {
		name: "X_axis_operating_hours",
		startingByte: 72,
		type: PLC_Data_Types.Dint,
	},
	X_axis_operating_years: {
		name: "X_axis_operating_years",
		startingByte: 76,
		type: PLC_Data_Types.Dint,
	},
	X_axis_distance_m: {
		name: "X_axis_distance_m",
		startingByte: 80,
		type: PLC_Data_Types.Dint,
	},
	X_axis_distance_km: {
		name: "X_axis_distance_km",
		startingByte: 84,
		type: PLC_Data_Types.Dint,
	},
	Z_axis_operating_seconds: {
		name: "Z_axis_operating_seconds",
		startingByte: 88,
		type: PLC_Data_Types.Dint,
	},
	Z_axis_operating_hours: {
		name: "Z_axis_operating_hours",
		startingByte: 92,
		type: PLC_Data_Types.Dint,
	},
	Z_axis_operating_years: {
		name: "Z_axis_operating_years",
		startingByte: 96,
		type: PLC_Data_Types.Dint,
	},
	Z_axis_distance_m: {
		name: "Z_axis_distance_m",
		startingByte: 100,
		type: PLC_Data_Types.Dint,
	},
	Z_axis_distance_km: {
		name: "Z_axis_distance_km",
		startingByte: 104,
		type: PLC_Data_Types.Dint,
	},
	Z2_axis_operating_sec: {
		name: "Z2_axis_operating_sec",
		startingByte: 108,
		type: PLC_Data_Types.Dint,
	},
	Z2_axis_operating_hours: {
		name: "Z2_axis_operating_hours",
		startingByte: 112,
		type: PLC_Data_Types.Dint,
	},
	Z2_axis_operating_years: {
		name: "Z2_axis_operating_years",
		startingByte: 116,
		type: PLC_Data_Types.Dint,
	},
	Z2_axis_distance_m: {
		name: "Z2_axis_distance_m",
		startingByte: 120,
		type: PLC_Data_Types.Dint,
	},
	Z2_axis_distance_km: {
		name: "Z2_axis_distance_km",
		startingByte: 124,
		type: PLC_Data_Types.Dint,
	},
	depth_1_pick_drop: {
		name: "depth_1_pick_drop",
		startingByte: 128,
		type: PLC_Data_Types.Dint,
	},
	depth_2_pick_drop: {
		name: "depth_2_pick_drop",
		startingByte: 132,
		type: PLC_Data_Types.Dint,
	},
	depth_3_pick_drop: {
		name: "depth_3_pick_drop",
		startingByte: 136,
		type: PLC_Data_Types.Dint,
	},
	depth_4_pick_drop: {
		name: "depth_4_pick_drop",
		startingByte: 140,
		type: PLC_Data_Types.Dint,
	},
	depth_5_pick_drop: {
		name: "depth_5_pick_drop",
		startingByte: 144,
		type: PLC_Data_Types.Dint,
	},
	depth_6_pick_drop: {
		name: "depth_6_pick_drop",
		startingByte: 148,
		type: PLC_Data_Types.Dint,
	},
	depth_7_pick_drop: {
		name: "depth_7_pick_drop",
		startingByte: 152,
		type: PLC_Data_Types.Dint,
	},
	depth_8_pick_drop: {
		name: "depth_8_pick_drop",
		startingByte: 156,
		type: PLC_Data_Types.Dint,
	},
	depth_9_pick_drop: {
		name: "depth_9_pick_drop",
		startingByte: 160,
		type: PLC_Data_Types.Dint,
	},
	depth_10_pick_drop: {
		name: "depth_10_pick_drop",
		startingByte: 164,
		type: PLC_Data_Types.Dint,
	},
	W_axis_operating_seconds: {
		name: "W_axis_operating_seconds",
		startingByte: 168,
		type: PLC_Data_Types.Dint,
	},
	W_axis_operating_hours: {
		name: "W_axis_operating_hours",
		startingByte: 172,
		type: PLC_Data_Types.Dint,
	},
	W_axis_operating_years: {
		name: "W_axis_operating_years",
		startingByte: 176,
		type: PLC_Data_Types.Dint,
	},
	W_axis_distance_cm: {
		name: "W_axis_distance_cm",
		startingByte: 180,
		type: PLC_Data_Types.Dint,
	},
	W_axis_distance_m: {
		name: "W_axis_distance_m",
		startingByte: 184,
		type: PLC_Data_Types.Dint,
	},
	W_axis_actions: {
		name: "W_axis_actions",
		startingByte: 188,
		type: PLC_Data_Types.Dint,
	},
	fp1_cycles: {
		name: "fp1_cycles",
		startingByte: 192,
		type: PLC_Data_Types.Dint,
	},
	fp2_cycles: {
		name: "fp2_cycles",
		startingByte: 196,
		type: PLC_Data_Types.Dint,
	},
	fp3_cycles: {
		name: "fp3_cycles",
		startingByte: 200,
		type: PLC_Data_Types.Dint,
	},
	fp4_cycles: {
		name: "fp4_cycles",
		startingByte: 204,
		type: PLC_Data_Types.Dint,
	},
	fault_count: {
		name: "fault_count",
		startingByte: 208,
		type: PLC_Data_Types.Dint,
	},
	warning_count: {
		name: "warning_count",
		startingByte: 212,
		type: PLC_Data_Types.Dint,
	},
	RESET_TIME: {
		name: "RESET_TIME",
		startingByte: 216,
		type: PLC_Data_Types.TimeOfDay,
	},
	RESET_DATE: {
		name: "RESET_DATE",
		startingByte: 220,
		type: PLC_Data_Types.Date,
	},
};
