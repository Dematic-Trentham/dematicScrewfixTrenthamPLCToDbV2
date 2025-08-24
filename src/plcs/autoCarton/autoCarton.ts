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
type autoCartonMachineType = "erector" | "Lidder" | "iPack";

import { runTask, createTimedTasks } from "../../debuging.js";

//function to be run from the main program every 10 seconds
//this function will read the data from the PLC and store it in the database
async function getAndInsertFaultsForAutoCarton() {
	runTask("erectors", 5 * 1000, async () => {
		const start = Date.now();
		console.log("Running erector task...");
		await getErectors();
		console.log(`Finished erector task. Time taken: ${Date.now() - start}ms`);
	});

	runTask("ipacks", 5 * 1000, async () => {
		const start = Date.now();
		console.log("Running ipack task...");
		await getIpacks();
		console.log(`Finished ipack task. Time taken: ${Date.now() - start}ms`);
	});

	runTask("lidder", 5 * 1000, async () => {
		const start = Date.now();
		console.log("Running lidder task...");
		await getLidders();
		console.log(`Finished lidder task. Time taken: ${Date.now() - start}ms`);
	});
}

async function getErectors() {
	const errors: { name: string; error: any }[] = [];

	//Lines 1-4
	const tasks = createTimedTasks([
		{
			name: "erector1",
			task: async () =>
				oldCartonErector.getAndInsertFaultsForOldErector(
					"10.4.2.160",
					"erector",
					1
				),
		},
		{
			name: "erector2",
			task: async () =>
				oldCartonErector.getAndInsertFaultsForOldErector(
					"10.4.2.161",
					"erector",
					2
				),
		},
		{
			name: "erector3",
			task: async () =>
				oldCartonErector.getAndInsertFaultsForOldErector(
					"10.4.2.162",
					"erector",
					3
				),
		},
		{
			name: "erector4",
			task: async () =>
				newCartonErector.getAndInsertFaults("10.4.2.163", "erector", 4),
		},
		{
			name: "erector5",
			task: async () =>
				newCartonErector.getAndInsertFaults("10.4.2.164", "erector", 5),
		},
		{
			name: "erector1Watchdog",
			task: async () => checkAndPingPLC("10.4.2.160", "erector", 1),
		},
		{
			name: "erector2Watchdog",
			task: async () => checkAndPingPLC("10.4.2.161", "erector", 2),
		},
		{
			name: "erector3Watchdog",
			task: async () => checkAndPingPLC("10.4.2.162", "erector", 3),
		},
		{
			name: "erector4Watchdog",
			task: async () => checkAndPingPLC("10.4.2.163", "erector", 4),
		},
		{
			name: "erector5Watchdog",
			task: async () => checkAndPingPLC("10.4.2.164", "erector", 5),
		},
	]);
	for (let i = 0; i < tasks.length; i += 3) {
		const batch = tasks.slice(i, i + 3);
		await Promise.all(
			batch.map(({ name, task }) =>
				task.catch((error) => {
					errors.push({
						name: name,
						error: error,
					});
				})
			)
		);
	}

	return errors;
}

async function getLidders() {
	const errors: { name: string; error: any }[] = [];

	const tasks = createTimedTasks([
		//	{
		//		name: "lidder1",
		//		task: async () =>
		//			newIpackv1.getAndInsertFaults("10.4.2.151", "Lidder", 1, "TIA"),
		//	},
		{
			name: "lidder2",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.153", "Line2Lidder", "Lidder", 2),
		},
		//	{
		//		name: "lidder3",
		//		task: async () =>
		//			newIpackv1.getAndInsertFaults("10.4.2.155", "Lidder", 3, "TIA"),
		//	},
		{
			name: "lidder4",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.157", "Line4Lidder", "Lidder", 4),
		},

		{
			name: "lidder1Watchdog",
			task: async () => checkAndPingPLC("10.4.2.151", "Lidder", 1),
		},
		{
			name: "lidder2Watchdog",
			task: async () => checkAndPingPLC("10.4.2.153", "Lidder", 2),
		},
		{
			name: "lidder3Watchdog",
			task: async () => checkAndPingPLC("10.4.2.155", "Lidder", 3),
		},
		{
			name: "lidder4Watchdog",
			task: async () => checkAndPingPLC("10.4.2.157", "Lidder", 4),
		},
	]);

	for (let i = 0; i < tasks.length; i += 3) {
		const batch = tasks.slice(i, i + 3);
		await Promise.all(
			batch.map(({ name, task }) =>
				task.catch((error) => {
					errors.push({
						name: name,
						error: error,
					});
				})
			)
		);
	}

	return errors;
}

async function getIpacks() {
	const errors: { name: string; error: any }[] = [];

	const tasks = createTimedTasks([
		{
			name: "ipack1",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.150", "Line1iPack", "iPack", 1),
		},
		{
			name: "ipack2",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.152", "Line2iPack", "iPack", 2),
		},
		{
			name: "ipack3",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.154", "Line3iPack", "iPack", 3),
		},
		{
			name: "ipack4",
			task: async () =>
				oldCC.getBPlusMachine("10.4.2.156", "Line4iPack", "iPack", 4),
		},
		{
			name: "ipack5",
			task: async () => newIpackv1.getAndInsertFaults("10.4.2.158", "iPack", 5),
		},
		{
			name: "ipack6",
			task: async () => newIpackv1.getAndInsertFaults("10.4.2.159", "iPack", 6),
		},

		{
			name: "ipack1Watchdog",
			task: async () => checkAndPingPLC("10.4.2.150", "iPack", 1),
		},
		{
			name: "ipack2Watchdog",
			task: async () => checkAndPingPLC("10.4.2.152", "iPack", 2),
		},
		{
			name: "ipack3Watchdog",
			task: async () => checkAndPingPLC("10.4.2.154", "iPack", 3),
		},
		{
			name: "ipack4Watchdog",
			task: async () => checkAndPingPLC("10.4.2.156", "iPack", 4),
		},
		{
			name: "ipack5Watchdog",
			task: async () => checkAndPingPLC("10.4.2.158", "iPack", 5),
		},
		{
			name: "ipack6Watchdog",
			task: async () => checkAndPingPLC("10.4.2.159", "iPack", 6),
		},
	]);

	for (let i = 0; i < tasks.length; i += 3) {
		const batch = tasks.slice(i, i + 3);
		await Promise.all(
			batch.map(({ name, task }) =>
				task.catch((error) => {
					errors.push({
						name: name,
						error: error,
					});
				})
			)
		);
	}

	return errors;
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
		const pingPromise = ping.promise.probe(ip, {
			timeout: 5, // 5 second timeout (may not work as expected on Windows)
			min_reply: 1,
		});
		const timeoutPromise = new Promise((resolve) =>
			setTimeout(() => resolve({ alive: false }), 5000)
		);
		const res: any = await Promise.race([pingPromise, timeoutPromise]);
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
