//Service for Dematic Dashboard Screwfix trentham to collect data from plc's and push to DB
//Created by: JWL
//Date: 2025/03/02 02:51:41
//Last modified: 2024/10/26 10:28:56
const version = "1.0.1";

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
	logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

//startup text
logger.info("Dematic Dashboard Micro Service - PLC To DB");
logger.info("Starting PLC To DB Service ....");

logger.info("Starting PLC To DB Service v" + version + " ....");

//imports
import cron from "node-cron";

//import plc service
import plc31 from "./plcs/plc31.js";
import plcShuttles from "./plcs/DMS/plcShuttles.js";
import emsZones from "./plcs/EMSZones/masterEMS.js";
import autoCarton from "./plcs/autoCarton/autoCarton.js";
import logger from "./misc/logging.js";

import { runTask, createTimedTasks } from "./debuging.js";

cron.schedule("*/5 * * * * *", async () => {
	runTask("Cron 5s", 5 * 1000, async () => {
		try {
			await plcShuttles.readShuttlesFaults();
		} catch (error) {
			logger.error("Error in 5s cron job:", error);
		}
	});
});

//ever day at 02:00 restart the service
cron.schedule("0 2 * * *", async () => {
	logger.info("Restarting PLC To DB Service...");

	//restart the service
	process.exit(0);
});

//run every 5 seconds
cron.schedule("*/5 * * * * *", async () => {
	//return;

	runTask("Cron 5s", 5 * 1000, async () => {
		try {
			logger.info("Running 5s cron job...");

			const tasks = [
				{
					name: "readDataFromPLC31TenSeconds",
					task: async () => await plc31.readDataFromPLC31TenSeconds(),
				},
				{
					name: "getAndInsertFaultsForAutoCarton",
					task: async () => await autoCarton.getAndInsertFaultsForAutoCarton(),
				},
				//{
				//	name: "readShuttlesFaults",
				//	task: async () => await plcShuttles.readShuttlesFaults(),
				//},
			];

			await Promise.all(
				tasks.map(({ name, task }) =>
					task().catch((error) => {
						logger.error(`Error in  function ${name}:`, error);
					})
				)
			);
		} catch (error) {
			logger.error("Error in 5s cron job:", error);
		}
	});
});

//run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
	runTask("Cron 5m", 60 * 5 * 1000, async () => {
		try {
			const tasks = createTimedTasks([
				{
					name: "readShuttlesLocations",
					task: async () => await plcShuttles.readShuttlesLocations(),
				},
			]);

			await Promise.all(
				tasks.map(({ name, task }) =>
					task.catch((error) => {
						logger.error(`Error in  function ${name}:`, error);
					})
				)
			);
		} catch (error) {
			logger.error("Error in 5m cron job:", error);
		}
	});
});

//run every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
	runTask("Cron 10 S", 10 * 1000, async () => {
		try {
			const tasks = createTimedTasks([
				{ name: "readEMS10", task: async () => await emsZones.checkAllEMS() },
			]);

			await Promise.all(
				tasks.map(({ name, task }) =>
					task.catch((error) => {
						logger.error(`Error in  function ${name}:`, error);
					})
				)
			);
		} catch (error) {
			logger.error("Error in 30s cron job:", error);
		}
	});
});
