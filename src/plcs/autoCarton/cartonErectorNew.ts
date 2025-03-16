//Carton Erectors New - Erector 5
//Created by: JWL
//Date: 2023/09/02 12:51:41
//Last modified: 2024/03/16 11:57:28
//Version: 1.0.0

//list of faults and there locations
const faults = [
	{ fault: "Test Fault", location: "1.2", current: false },
	{ fault: "D10 Empty Pallet Defect", location: "84.1", current: false },
	{
		fault: "D11 Transfer Towards Cavity Motion Defect",
		location: "84.2",
		current: false,
	},
	{
		fault: "D12 Transfer Towards Instacking Motion Defect",
		location: "84.3",
		current: false,
	},
	{
		fault: "D13 Take Away Carton Sheet at Unstacking",
		location: "84.4",
		current: false,
	},
	{
		fault: "D14 Take Away Carton Sheet on Cavity",
		location: "84.5",
		current: false,
	},
	{ fault: "D15 Defect Box Under Cavity", location: "84.6", current: false },
	{ fault: "D16 Defect Box in Cavity", location: "84.7", current: false },
	{
		fault: "D17 Magazine Lift Upward Motion Defect",
		location: "87.0",
		current: false,
	},
	{
		fault: "D18 Magazine Lift Downward Motion Defect",
		location: "87.1",
		current: false,
	},
	{ fault: "D19 Magazine Lift Upper End", location: "87.2", current: false },
	{ fault: "D2 Circuit Breaker Motors", location: "85.1", current: false },
	{
		fault: "D20 End Sensor Transfer Towards Cavity",
		location: "87.3",
		current: false,
	},
	{
		fault: "D21 End Sensor Transfer Towards Unstacking",
		location: "87.4",
		current: false,
	},
	{
		fault: "D22 Centering Cylinder Forward Motion Defect",
		location: "87.5",
		current: false,
	},
	{
		fault: "D23 Centering Cylinder Backward Motion Defect",
		location: "87.6",
		current: false,
	},
	{
		fault: "D24 Downward Motion Piston Defect",
		location: "87.7",
		current: false,
	},
	{
		fault: "D25 Upward Motion Piston Defect",
		location: "86.0",
		current: false,
	},
	{
		fault: "D26 Unstacking Cylinders Forward Motion Defect",
		location: "86.1",
		current: false,
	},
	{
		fault: "D27 Unstacking Cylinders Backward Motion Defect",
		location: "86.2",
		current: false,
	},
	{ fault: "D28 Fugitive Glue Tank Defect", location: "86.3", current: false },
	{
		fault: "D29 Fugitive Glue Tank Def - Low Level",
		location: "86.4",
		current: false,
	},
	{
		fault: "D30 Fugitive Glue Tank Not Ready",
		location: "86.5",
		current: false,
	},
	{
		fault: "D31 Transfer Origin Catch Defect",
		location: "86.6",
		current: false,
	},
	{ fault: "D32 Transfer Variator Defect", location: "86.7", current: false },
	{
		fault: "D33 Wrong Pallet Position in Side",
		location: "89.0",
		current: false,
	},
	{
		fault: "D34 Carton Sheet on Transfer Missing",
		location: "89.1",
		current: false,
	},
	{
		fault: "D35 Take Away Carton Sheet on Transfer",
		location: "89.2",
		current: false,
	},
	{ fault: "D36 Upper End Sensor Piston", location: "89.3", current: false },
	{ fault: "D37 Lower End Sensor Piston", location: "89.4", current: false },
	{ fault: "D38 Piston Origin Catch Defect", location: "89.5", current: false },
	{ fault: "D39 Piston Variator Defect", location: "89.6", current: false },
	{
		fault: "D40 Wrong Pallet Position Longitudinal",
		location: "89.7",
		current: false,
	},
	{
		fault: "D41 Dialogue Transfer Variator Defect",
		location: "88.0",
		current: false,
	},
	{
		fault: "D42 Dialogue Piston Variator Defect",
		location: "88.1",
		current: false,
	},
	{
		fault: "D43 Centering Cylinder Forward Motion Garage Position Defect",
		location: "88.2",
		current: false,
	},
	{
		fault: "D44 Back Centering Cylinder Forward Motion Defect",
		location: "88.3",
		current: false,
	},
	{
		fault: "D45 Back Centering Cylinder Backward Motion Defect",
		location: "88.4",
		current: false,
	},
	{
		fault: "D46 High Pallet Level Default with Low Magazine Lift",
		location: "88.5",
		current: false,
	},
	{
		fault: "D47 Centralizer No Open to Lift Up",
		location: "88.6",
		current: false,
	},
	{ fault: "D48", location: "88.7", current: false },
	{
		fault: "D4 Box Erecting Glue Tank Defect",
		location: "85.3",
		current: false,
	},
	{
		fault: "D5 Box Erecting Glue Stock Low Level Defect",
		location: "85.4",
		current: false,
	},
	{
		fault: "D6 Box Erecting Glue Tank Not Ready",
		location: "85.5",
		current: false,
	},
	{ fault: "D7 General Air Pressure Defect", location: "85.6", current: false },
	{
		fault: "D8 Carton Sheet at Unstacking Missing",
		location: "85.7",
		current: false,
	},
	{
		fault: "D9 Carton Sheet on Cavity Missing",
		location: "84.0",
		current: false,
	},
	{ fault: "D1 Emergency Stop", location: "85.0", current: false },
	{ fault: "D3 Opened Door", location: "85.2", current: false },
];

//import newb+
import newBPlus from "./newB+.js";
type autoCartonMachineType = "erector" | "Lidder" | "iPack";

async function getAndInsertFaults(
	ip: string,
	machineType: autoCartonMachineType,
	line: number,
	version: string = "S7"
) {
	await newBPlus.getAndInsertFaults(
		ip,
		machineType,
		line,
		faults,
		11,
		70,
		version
	);
}

export default { getAndInsertFaults };
