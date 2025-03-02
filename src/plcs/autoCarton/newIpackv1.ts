//Carton Erectors New - Erector 5
//Created by: JWL
//Date: 2023/09/02 12:51:41
//Last modified: 2023/12/09 16:37:01
//Version: 1.0.0

//list of faults and there locations
let faults = [
	{ fault: "	D1 Emergency Stop	", location: "85.0", current: false },
	{ fault: "	D2 Circuit Breaker	", location: "85.1", current: false },
	{ fault: "	D3 Opened Door	", location: "85.2", current: false },
	{ fault: "	D4 Glue Tank Defect	", location: "85.3", current: false },
	{ fault: "	D5 Glue Stock Low Level Defect	", location: "85.4", current: false },
	{ fault: "	D6 Glue Tank Not Ready	", location: "85.5", current: false },
	{ fault: "	D7 General Air Pressure Defect	", location: "85.6", current: false },
	{ fault: "	D8 Low General Air Pressure	", location: "85.7", current: false },
	{ fault: "	D9 Lid Under Cavity Defect	", location: "84.0", current: false },
	{
		fault: "	D10 Box Missing At Gluing Station	",
		location: "84.1",
		current: false,
	},
	{
		fault: "	D100 Security Xl1 Magazine Conveyor Defect	",
		location: "95.3",
		current: false,
	},
	{
		fault: "	D101 Security Xl2 Magazine Conveyor Defect	",
		location: "95.4",
		current: false,
	},
	{
		fault: "	D102 Mxl Transfer Motion To Ipack Defect	",
		location: "95.5",
		current: false,
	},
	{
		fault: "	D103 Mxl Transfer Motion To Unstacker Defect	",
		location: "95.6",
		current: false,
	},
	{
		fault: "	D104 Mxl Transfer Origin Catch Defect	",
		location: "95.7",
		current: false,
	},
	{
		fault: "	D105 Security Xl3 Magazine Conveyor Defect	",
		location: "94.0",
		current: false,
	},
	{
		fault: "	D106 Security Xl4 Magazine Conveyor Defect	",
		location: "94.1",
		current: false,
	},
	{
		fault: "	D107 Lid Missing At Unstacker To Mxl Transfer Position	",
		location: "94.2",
		current: false,
	},
	{ fault: "	D108 Bad Mxl Transfer Position	", location: "94.3", current: false },
	{ fault: "	D109 Mxl Arm Unstacker Motion	", location: "94.4", current: false },
	{ fault: "	D11 Introduction Box Defect	", location: "84.2", current: false },
	{
		fault: "	D110 Upstream Centering Cylinder Forward Motion Defect (Closing)	",
		location: "94.5",
		current: false,
	},
	{
		fault: "	D111 Upstream Centering Cylinder Backward Motion Defect (Opening)	",
		location: "94.6",
		current: false,
	},
	{ fault: "	D112	", location: "94.7", current: false },
	{
		fault: "	D113 Bad Position Of Gluing Guns On Transfer	",
		location: "97.0",
		current: false,
	},
	{
		fault: "	D114 One Down Position Arm Unstacker Mxl 1 Or 2 Missing	",
		location: "97.1",
		current: false,
	},
	{
		fault: "	D115 Motion Lid On Xl2 Magazine Conveyor Defect	",
		location: "97.2",
		current: false,
	},
	{
		fault: "	D116 Mxl2 Arm Unstacker Upward Motion Defect	",
		location: "97.3",
		current: false,
	},
	{
		fault: "	D117 Mxl2 Arm Unstacker Downward Motion Defect	",
		location: "97.4",
		current: false,
	},
	{
		fault:
			"	D118 Height Upstream Centering Cylinder Forward Motion Defect (Upward)	",
		location: "97.5",
		current: false,
	},
	{
		fault:
			"	D119 Height Upstream Centering Cylinder Backward Motion Defect (Downward)	",
		location: "97.6",
		current: false,
	},
	{
		fault: "	D12 Defect Sensor Low Speed Active Lid Lift	",
		location: "84.3",
		current: false,
	},
	{ fault: "	D120	", location: "97.7", current: false },
	{
		fault: "	D121 Take Off The Lid Ready For Transfer	",
		location: "96.0",
		current: false,
	},
	{ fault: "	D122 Empty Xl2 Magazine Defect	", location: "96.1", current: false },
	{
		fault: "	D123 Motion Lid On Xl3 Magazine Conveyor Defect	",
		location: "96.2",
		current: false,
	},
	{
		fault: "	D124 Mxl3 Arm Unstacker Upward Motion Defect	",
		location: "96.3",
		current: false,
	},
	{
		fault: "	D125 Mxl3 Arm Unstacker Downward Motion Defect	",
		location: "96.4",
		current: false,
	},
	{
		fault:
			"	D126 Downstream Centering Cylinder Forwardd Motion Defect (Closing)	",
		location: "96.5",
		current: false,
	},
	{
		fault:
			"	D127 Downstream Centering Cylinder Backward Motion Defect (Opening)	",
		location: "96.6",
		current: false,
	},
	{ fault: "	D128	", location: "96.7", current: false },
	{ fault: "	D129 Empty Xl3 Magazine Defect	", location: "99.0", current: false },
	{
		fault: "	D13 Lid Lift Upward Motion Defect	",
		location: "84.4",
		current: false,
	},
	{
		fault: "	D130 Motion Lid On Xl4 Magazine Conveyor Defect	",
		location: "99.1",
		current: false,
	},
	{
		fault: "	D131 Mxl4 Arm Unstacker Upward Motion Defect	",
		location: "99.2",
		current: false,
	},
	{
		fault: "	D132 Mxl4 Arm Unstacker Downward Motion Defect	",
		location: "99.3",
		current: false,
	},
	{
		fault:
			"	D133 Height Downstream Centering Cylinder Forward Motion Defect (Upward)	",
		location: "99.4",
		current: false,
	},
	{
		fault:
			"	D134 Height Downstream Centering Cylinder Backward Motion Defect (Downward)	",
		location: "99.5",
		current: false,
	},
	{ fault: "	D135	", location: "99.6", current: false },
	{ fault: "	D136 Empty Xl4 Magazine Defect	", location: "99.7", current: false },
	{
		fault: "	D137 One Down Position Arm Unstacker Mxl 3 Or 4 Missing	",
		location: "98.0",
		current: false,
	},
	{ fault: "	D138 Empty Xl1 Magazine Defect	", location: "98.1", current: false },
	{
		fault: "	D139 Xl Magazine Transfer Inverter Defect	",
		location: "98.2",
		current: false,
	},
	{
		fault: "	D14 Lid Lift Downward Motion Defect	",
		location: "84.5",
		current: false,
	},
	{
		fault: "	D140 Dialogue With Xl Magazine Transfer Inverter Defect	",
		location: "98.3",
		current: false,
	},
	{
		fault: "	D141 Dialogue With Lid Lift Inverter Defect	",
		location: "98.4",
		current: false,
	},
	{
		fault: "	D15 Step By Step Conveyor Forward Motion Defect	",
		location: "84.6",
		current: false,
	},
	{
		fault: "	D16 (Long Side If Oyster) Pressing Cylinder Forward Motion Defect	",
		location: "84.7",
		current: false,
	},
	{
		fault: "	D17 (Long Side If Oyster) Pressing Cylinder Backward Motion Defect	",
		location: "87.0",
		current: false,
	},
	{
		fault: "	D18 Filling Sensor For Stop Or Lsp Of Marking Lift Defect	",
		location: "87.1",
		current: false,
	},
	{ fault: "	D19 Wrongly Glued Lid	", location: "87.2", current: false },
	{
		fault: "	D20 Lid Centering Cylinder Forwardd Motion Defect	",
		location: "87.3",
		current: false,
	},
	{
		fault: "	D21 Lid Centering Cylinder Backwardd Motion Defect	",
		location: "87.4",
		current: false,
	},
	{
		fault: "	D22 Exit Box Acknoledge Missing	",
		location: "87.5",
		current: false,
	},
	{
		fault: "	D23 Box Position At Lid Station Defect	",
		location: "87.6",
		current: false,
	},
	{
		fault: "	D24 Chosen Inhibited Magazine Xl Defect	",
		location: "87.7",
		current: false,
	},
	{
		fault: "	D25 Marking Lift Upward Motion Defect	",
		location: "86.0",
		current: false,
	},
	{
		fault: "	D26 Marking Lift Downward Motion Defect	",
		location: "86.1",
		current: false,
	},
	{
		fault: "	D27 Horizontal Marking Cylinder Forward Motion Defect	",
		location: "86.2",
		current: false,
	},
	{
		fault: "	D28 Horizontal Marking Cylinder Backward Motion Defect	",
		location: "86.3",
		current: false,
	},
	{
		fault: "	D29 Oblique Marking Cylinder Forward Motion Defect	",
		location: "86.4",
		current: false,
	},
	{
		fault: "	D30 Oblique Marking Cylinder Backward Motion Defect	",
		location: "86.5",
		current: false,
	},
	{
		fault: "	D31 Box Missing At Marking Station	",
		location: "86.6",
		current: false,
	},
	{
		fault: "	D32 Security For Movement Step By Step Conveyor Missing	",
		location: "86.7",
		current: false,
	},
	{
		fault: "	D33 Security For Movement Marking Lift Missing	",
		location: "89.0",
		current: false,
	},
	{
		fault: "	D34 Security For Movement Lid Lift Missing	",
		location: "89.1",
		current: false,
	},
	{ fault: "	D35 Wrongly Glued Flap	", location: "89.2", current: false },
	{
		fault: "	D36 Step By Step Conveyor Inverter Defect	",
		location: "89.3",
		current: false,
	},
	{
		fault: "	D37 Folding Cylinder Forward Motion Defect	",
		location: "89.4",
		current: false,
	},
	{
		fault: "	D38 Folding Cylinder Backward Motion Defect	",
		location: "89.5",
		current: false,
	},
	{
		fault: "	D39 Box Missing At Folding Station	",
		location: "89.6",
		current: false,
	},
	{
		fault: "	D40 Introduction Conveyor Not Ready	",
		location: "89.7",
		current: false,
	},
	{ fault: "	D41 Bar Code Scanner Defect	", location: "88.0", current: false },
	{ fault: "	D42 No Read Barcode	", location: "88.1", current: false },
	{
		fault: "	D43 Counterplate In Upper Position	",
		location: "88.2",
		current: false,
	},
	{
		fault: "	D44 Box Position At Marking Station Defect	",
		location: "88.3",
		current: false,
	},
	{ fault: "	D45 Blocked Initialization	", location: "88.4", current: false },
	{
		fault: "	D46 Box Position At Folding Station Defect	",
		location: "88.5",
		current: false,
	},
	{
		fault: "	D47 Box Missing At Lid Centering	",
		location: "88.6",
		current: false,
	},
	{ fault: "	D48 Lid Missing Under Cavity	", location: "88.7", current: false },
	{
		fault: "	D49 Marking Centering Cylinder Forwardd Motion Defect	",
		location: "91.0",
		current: false,
	},
	{
		fault: "	D50 Marking Centering Cylinder Backwardd Motion Defect	",
		location: "91.1",
		current: false,
	},
	{
		fault: "	D51 Detection Under Cavity At Marking Station	",
		location: "91.2",
		current: false,
	},
	{
		fault: "	D52 Marking Lift Inverter Defect	",
		location: "91.3",
		current: false,
	},
	{ fault: "	D53 Lid Lift Inverter Defect	", location: "91.4", current: false },
	{ fault: "	D54 Box Too Filled	", location: "91.5", current: false },
	{
		fault: "	D55 Marking Lift Upw Motion Low Speed Def	",
		location: "91.6",
		current: false,
	},
	{
		fault: "	D56 Elevator Upward Motion Defect	",
		location: "91.7",
		current: false,
	},
	{
		fault: "	D57 Elevator Downward Motion Defect	",
		location: "90.0",
		current: false,
	},
	{
		fault: "	D58 Cavity Suction Cups Cylinder Forwardd Motion Defect	",
		location: "90.1",
		current: false,
	},
	{
		fault: "	D59 Cavity Suction Cups Cylinder Backwardd Motion Defect	",
		location: "90.2",
		current: false,
	},
	{
		fault: "	D60 Folding Centering Cylinder Forwardd Motion Defect	",
		location: "90.3",
		current: false,
	},
	{
		fault: "	D61 Folding Centering Cylinder Backwardd Motion Defect	",
		location: "90.4",
		current: false,
	},
	{
		fault: "	D62 Lid Lift Low Position Missing	",
		location: "90.5",
		current: false,
	},
	{
		fault: "	D63 Marking Lift Low Position Missing	",
		location: "90.6",
		current: false,
	},
	{
		fault: "	D64 Step By Step Conveyor In Position Missing	",
		location: "90.7",
		current: false,
	},
	{
		fault: "	D65 Dialogue With Supervision Defect	",
		location: "93.0",
		current: false,
	},
	{
		fault: "	D66 System Image Taken/Supervision Not Ready	",
		location: "93.1",
		current: false,
	},
	{
		fault: "	D67 Dialogue With System Image Taken Defect	",
		location: "93.2",
		current: false,
	},
	{
		fault: "	D68 Dialogue With Step By Step Conveyor Inverter Defect	",
		location: "93.3",
		current: false,
	},
	{
		fault: "	D69 Counter-Plate Upward Motion Defect	",
		location: "93.4",
		current: false,
	},
	{
		fault: "	D70 Counter-Plate Downward Motion Defect	",
		location: "93.5",
		current: false,
	},
	{
		fault: "	D71 Pressing Cylinder Forward Motion Defect Short Side 	",
		location: "93.6",
		current: false,
	},
	{
		fault: "	D72 Pressing Cylinder Backward Motion Defect Short Side	",
		location: "93.7",
		current: false,
	},
	{
		fault: "	D73 Lack Of Security Center Headdress Closed	",
		location: "92.0",
		current: false,
	},
	{
		fault: "	D74 Lack Of Security Center Closed Marking	",
		location: "92.1",
		current: false,
	},
	{ fault: "	D75 Nordson Communication	", location: "92.2", current: false },
	{
		fault: "	D76 Default Presence Of Object Under Lid Lift 	",
		location: "92.3",
		current: false,
	},
	{
		fault: "	D77 Absence Of Box Upstream Of The Lid Station	",
		location: "92.4",
		current: false,
	},
	{
		fault: "	D78 Default Presence Of Object Under Marking Lift 	",
		location: "92.5",
		current: false,
	},
	{
		fault: "	D97 Motion Lid On Xl1 Magazine Conveyor Defect	",
		location: "95.0",
		current: false,
	},
	{
		fault: "	D98 Mxl Arm Unstacker Upward Motion Defect	",
		location: "95.1",
		current: false,
	},
	{
		fault: "	D99 Mxl Arm Unstacker Downward Motion Defect	",
		location: "95.2",
		current: false,
	},
];

import { autoCartonMachineType } from "@prisma/client";
//import newb+
import newBPlus from "./newB+.js";

async function getAndInsertFaults(
	ip: string,
	machineType: autoCartonMachineType,
	line: number
) {
	await newBPlus.getAndInsertFaults(ip, machineType, line, faults, 11, 6);
}

export default { getAndInsertFaults };
