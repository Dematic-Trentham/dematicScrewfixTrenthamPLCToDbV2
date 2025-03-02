//Service for Dematic Dashboard Screwfix trentham to read date from Carton closing lines 1-4
//Created by: JWL
//Date: 2023/03/063 20:00:00
//Last modified: 2024/08/30 20:20:14
//Version: 0.0.1

import plcToDB from "../../misc/plcToDB.js";

//import types
import snap7Types from "../../misc/plc/types.js";

//import tryCatchSimple
import * as tryCatchSimple from "./../../misc/tryCatchSimple.js";
import newIpackv1 from "./newIpackv1.js";
import oldCC from "./machines.js";
import oldIpack from "./oldIpack.js";
import newCartonErector from "./cartonErectorNew.js";
import oldCartonErector from "./cartonErectorOld.js";

//array to store the last known data from each plc
let data: Record<string, any> = {};

//function to be run from the main program every 10 seconds
//this function will read the data from the PLC and store it in the database
async function getAndInsertFaultsForAutoCarton() {
	//  await getErectors()
	await getIpacks();
	await getLidders();
}

async function getErectors() {
	//Lines 1-4
	let tasks = [
		{
			name: "erector1",
			task: oldCartonErector.getAndInsertFaultsForOldErector(
				"10.4.2.160",
				"erector",
				1
			),
		},
		{
			name: "erector2",
			task: oldCartonErector.getAndInsertFaultsForOldErector(
				"10.4.2.161",
				"erector",
				2
			),
		},
		{
			name: "erector3",
			task: oldCartonErector.getAndInsertFaultsForOldErector(
				"10.4.2.162",
				"erector",
				3
			),
		},
		{
			name: "erector4",
			task: oldCartonErector.getAndInsertFaultsForOldErector(
				"10.4.2.163",
				"erector",
				4
			),
		},
		{
			name: "erector5",
			task: newCartonErector.getAndInsertFaults("10.4.2.164", "erector", 5),
		},
	];

	await Promise.all(
		tasks.map(({ name, task }) =>
			task.catch((error) => {
				console.error(`Error in function ${name}:`, error);
			})
		)
	);
}

async function getLidders() {
	//
	let tasks = [
		//{
		//	name: "lidder1",
		//	task: newIpackv1.getAndInsertFaults("10.4.2.151", "Lidder", 1),
		//},
		{
			name: "lidder2",
			task: oldCC.getBPlusMachine("10.4.2.153", "Line2Lidder", "Lidder", 2),
		},
		//	{
		//		name: "lidder3",
		//		task: newIpackv1.getAndInsertFaults("10.4.2.155", "Lidder", 3),
		//	},
		{
			name: "lidder4",
			task: oldCC.getBPlusMachine("10.4.2.157", "Line4Lidder", "Lidder", 4),
		},
	];

	await Promise.all(
		tasks.map(({ name, task }) =>
			task.catch((error) => {
				console.error(`Error in function ${name}:`, error);
			})
		)
	);
}

async function getIpacks() {
	//Lines 5 and 6
	let tasks = [
		{
			name: "ipack1",
			task: oldIpack.getAndInsertFaults("10.4.2.150", "iPack", 1),
		},
		{
			name: "ipack2",
			task: oldIpack.getAndInsertFaults("10.4.2.152", "iPack", 2),
		},
		{
			name: "ipack3",
			task: oldIpack.getAndInsertFaults("10.4.2.154", "iPack", 3),
		},
		{
			name: "ipack4",
			task: oldIpack.getAndInsertFaults("10.4.2.156", "iPack", 4),
		},
		{
			name: "ipack5",
			task: newIpackv1.getAndInsertFaults("10.4.2.158", "iPack", 5),
		},
		{
			name: "ipack6",

			task: newIpackv1.getAndInsertFaults("10.4.2.159", "iPack", 6),
		},
	];

	await Promise.all(
		tasks.map(({ name, task }) =>
			task.catch((error) => {
				console.error(`Error in function ${name}:`, error);
			})
		)
	);
}

//export the function
export default { getAndInsertFaultsForAutoCarton };
