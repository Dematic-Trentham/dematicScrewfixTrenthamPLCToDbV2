//Service for Dematic Dashboard Screwfix trentham to read ems Data
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:22:22
//Version: 0.0.1

import PLC1 from "./PLCS/PLC1.js";
import PLC2 from "./PLCS/PLC2.js";
import PLC11 from "./PLCS/PLC11.js";
import PLC12 from "./PLCS/PLC12.js";
import PLC13 from "./PLCS/PLC13.js";
import PLC21 from "./PLCS/PLC21.js";
import PLC22 from "./PLCS/PLC22.js";
import PLC23 from "./PLCS/PLC23.js";
import PLC24 from "./PLCS/PLC24.js";
import PLC31 from "./PLCS/PLC31.js";
import PLC32 from "./PLCS/PLC32.js";
import PLC33 from "./PLCS/PLC33.js";
import logger from "../../misc/logging.js";

async function checkAllEMS() {
	logger.info("Checking all EMS data");
	const tasks = [
		//{ name: "PLC1", task: PLC1.readEMSDataFromPLC1() },
		//{ name: "PLC2", task: PLC2.readEMSDataFromPLC2() },
		//{ name: "PLC11", task: PLC11.readEMSDataFromPLC11() },
		//	{ name: "PLC12", task: PLC12.readEMSDataFromPLC12() },
		//	{ name: "PLC13", task: PLC13.readEMSDataFromPLC13() },
		//	{ name: "PLC21", task: PLC21.readEMSDataFromPLC21() },
		//	{ name: "PLC22", task: PLC22.readEMSDataFromPLC22() },
		//	{ name: "PLC23", task: PLC23.readEMSDataFromPLC23() },
		//	{ name: "PLC24", task: PLC24.readEMSDataFromPLC24() },
		//{ name: "PLC31", task: PLC31.readEMSDataFromPLC31() },
		//	{ name: "PLC32", task: PLC32.readEMSDataFromPLC32() },
		//	{ name: "PLC33", task: PLC33.readEMSDataFromPLC33() },
		{ name: "test", task: console.log("test") },
	];

	await Promise.all(
		tasks.map(async ({ name, task }) => {
			try {
				await task;
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				logger.error(`Fault in ${name}`);
			}
		})
	);
}

export default { checkAllEMS };
