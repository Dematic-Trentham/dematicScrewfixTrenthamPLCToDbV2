//Service for Dematic Dashboard Screwfix trentham to read date from Carton closing lines 1-4
//Created by: JWL
//Date: 2023/03/063 20:00:00
//Last modified: 2024/08/30 20:20:14
//Version: 0.0.1

//import tryCatchSimple

import newIpackv1 from "./newIpackv1.js";
import oldCC from "./machines.js";

import newCartonErector from "./cartonErectorNew.js";
import oldCartonErector from "./cartonErectorOld.js";
import db from "../../db/db.js";
import ping from "ping";
import { addFaultsToDB } from "./faultAdder.js";
import { autoCartonMachineType } from "@prisma/client";
import logger from "../../misc/logging.js";

//function to be run from the main program every 10 seconds
//this function will read the data from the PLC and store it in the database
async function getAndInsertFaultsForAutoCarton() {
	await getErectors();
	await getIpacks();
	await getLidders();
}

async function getErectors() {
	//Lines 1-4
	const tasks = [
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
				logger.error(`Error in function ${name}:`, error);
			})
		)
	);
}

async function getLidders() {
	//
	const tasks = [
		{
			name: "lidder1",
			task: newIpackv1.getAndInsertFaults("10.4.2.151", "Lidder", 1, "TIA"),
		},
		{
			name: "lidder2",
			task: oldCC.getBPlusMachine("10.4.2.153", "Line2Lidder", "Lidder", 2),
		},
		//{
		//	name: "lidder3",
		//	task: newIpackv1.getAndInsertFaults("10.4.2.155", "Lidder", 3, "TIA"),
		//	},
		{
			name: "lidder4",
			task: oldCC.getBPlusMachine("10.4.2.157", "Line4Lidder", "Lidder", 4),
		},
	];

	await Promise.all(
		tasks.map(({ name, task }) =>
			task.catch((error) => {
				logger.error(`Error in function ${name}:`, error);
			})
		)
	);

	const tasks2 = [
		{
			name: "lidder1Watchdog",
			task: checkAndPingPLC("10.4.2.151", "Lidder", 1),
		},
		{
			name: "lidder2Watchdog",
			task: checkAndPingPLC("10.4.2.153", "Lidder", 2),
		},
		//{ name: "lidder3Watchdog", task: checkAndPingPLC("10.4.2.155", "Lidder", 3) },
		{
			name: "lidder4Watchdog",
			task: checkAndPingPLC("10.4.2.157", "Lidder", 4),
		},
	];

	await Promise.all(
		tasks2.map(({ name, task }) =>
			task.catch((error) => {
				logger.error(`Error in function ${name}:`, error);
			})
		)
	);
}

async function getIpacks() {
	const tasks = [
		{
			name: "ipack1",
			task: oldCC.getBPlusMachine("10.4.2.150", "Line1iPack", "iPack", 1),
		},
		{
			name: "ipack2",
			task: oldCC.getBPlusMachine("10.4.2.152", "Line2iPack", "iPack", 2),
		},
		{
			name: "ipack3",
			task: oldCC.getBPlusMachine("10.4.2.154", "Line3iPack", "iPack", 3),
		},
		{
			name: "ipack4",
			task: oldCC.getBPlusMachine("10.4.2.156", "Line4iPack", "iPack", 4),
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
				logger.error(`Error in function ${name}:`, error);
			})
		)
	);

	const tasks2 = [
		{ name: "ipack1Watchdog", task: checkAndPingPLC("10.4.2.150", "iPack", 1) },
		{ name: "ipack2Watchdog", task: checkAndPingPLC("10.4.2.152", "iPack", 2) },
		{ name: "ipack3Watchdog", task: checkAndPingPLC("10.4.2.154", "iPack", 3) },
		{ name: "ipack4Watchdog", task: checkAndPingPLC("10.4.2.156", "iPack", 4) },
		{ name: "ipack5Watchdog", task: checkAndPingPLC("10.4.2.158", "iPack", 5) },
		{ name: "ipack6Watchdog", task: checkAndPingPLC("10.4.2.159", "iPack", 6) },
	];

	await Promise.all(
		tasks2.map(({ name, task }) =>
			task.catch((error) => {
				logger.error(`Error in function ${name}:`, error);
			})
		)
	);
}

async function checkAndPingPLC(
	ip: string,
	machineType: autoCartonMachineType,
	line: number
) {
	const machineData = await db.autoCartonFaults.findFirst({
		where: {
			machineType,
			line,
			timestamp: { gt: new Date(new Date().getTime() - 60 * 1000) },
		},
	});

	if (machineData == null) {
		//	logger.error(`No data for 60 seconds for ${machineType} ${line}`);

		// No data for 60 seconds, let's ping the PLC
		const res = await ping.promise.probe(ip);
		if (res.alive) {
			//logger.error(`PLC ${ip} is reachable`);
			// Update the watchdog timer and add a watchdog to the db
			addFaultsToDB(machineType, "watchdog", line);
		} else {
			//	logger.error(`PLC ${ip} is not reachable`);
		}
	}
}

//export the function
export default { getAndInsertFaultsForAutoCarton };
