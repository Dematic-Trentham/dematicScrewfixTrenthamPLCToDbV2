//Carton Closing Old
//Created by: JWL
//Date: 2023/09/02 12:51:41
//Last modified: 2024/08/30 20:20:27
//Version: 1.0.0

//create array to store all carton closing data
const cartonClosingData: { [key: string]: any } = {};

import snap7 from "node-snap7";
//import db
import { addFaultsToDB } from "./faultAdder.js";

import { iPackFaults } from "./faultDefinitions/iPackFaults.js";
import { lidderFaults } from "./faultDefinitions/lidderFaults.js";
import { lidderFaultsLine1 } from "./faultDefinitions/lidderFaultsLine1.js";
type autoCartonMachineType = "erector" | "Lidder" | "iPack";
//import logger from "../../misc/logging.js";

//get Lidder Machine
async function getBPlusMachine(
	ipAddress: string,
	machineName: string,
	machineType: autoCartonMachineType,
	line: number
) {
	// eslint-disable-next-line no-async-promise-executor
	const promise = new Promise(async function (resolve, reject) {
		//make request object
		const request = {
			machine: machineName,
			ip: ipAddress,
			line: line,
			machineType: machineType,
		};

		try {
			const results = await getBPlusMachineFaults(request);

			//console.log(results);

			//check if the machine exists in the carton closing data array
			if (cartonClosingData[machineName] == undefined) {
				//if it doesn't, add it
				cartonClosingData[machineName] = [];
			}

			//for each fault key in the results
			for (const fault in results) {
				//if this is the first time the machine has been run, (undefined)
				if (cartonClosingData[machineName][fault] == undefined) {
					cartonClosingData[machineName][fault] = results[fault];
					//resolve(true);
					continue;
				}

				//check if the key exists in the carton closing data array
				if (cartonClosingData[machineName][fault] == undefined) {
					//if it doesn't, add it
					cartonClosingData[machineName][fault] = results[fault];
					continue;
				}

				//difference between the current value and the value in the carton closing data array
				const difference =
					results[fault] - cartonClosingData[machineName][fault];
				//console.log(machineName + " - Fault: " + fault + " - " + difference);

				//if 0,  reset the value
				if (
					results[fault] == 0 &&
					cartonClosingData[machineName][fault] != results[fault]
				) {
					//console.log("Resetting value" + machineName + " - " + fault);
					cartonClosingData[machineName][fault] = results[fault];
				} else {
					//if negative, skip,
					if (difference < 0) {
						//dconsole.log("Difference is negative, skipping" + machineName + " - " + fault);
						continue;
					}

					//check if the value is more than in the carton closing data array
					if (difference > 0) {
						//sync the value
						cartonClosingData[machineName][fault] = results[fault];

						//for (let index = 0; index < difference; index++) {
						//add the fault to the database

						await addFaultsToDB(machineType, fault, line);
						//}
					}
				}
			}

			resolve(true);
		} catch (err) {
			//logger.error("error in machine.js 1 - " + request.machine);
			reject({ machine: request.machine, err });
			//logger.error(err);
			return;
		}
	});
	return promise;
}

function getBPlusMachineFaults(request: {
	machine: string;
	ip: string;
	line: number;
	machineType: string;
}): Promise<any> {
	// eslint-disable-next-line no-async-promise-executor
	const promise = new Promise(async function (resolve, reject) {
		const ip = request.ip;

		if (request.machineType == "Lidder" && request.line == 1) {
			// console.log("aaaaaaaaaaaaa Lidder Line 1");
		}

		if (ip == undefined) {
			//logger.error("error in machine.js 2 - " + request.machine);
			reject({ machine: request.machine, err: "Wrong Variables" });
			return;
		}

		try {
			const returnedFaults = await ConnectToPlcToGetBPlusMachineFaults(request);

			resolve(returnedFaults);
		} catch (err) {
			reject({ machine: request.machine, err });
		}
	});

	return promise;
}
async function ConnectToPlcToGetBPlusMachineFaults(request: {
	machine: string;
	ip: string;
	line: number;
	machineType: string;
}): Promise<any> {
	const ip = request.ip;
	const line = request.line;

	// eslint-disable-next-line no-async-promise-executor
	const promise = new Promise(async function (resolve, reject) {
		//create new s7client
		const s7client = new snap7.S7Client();

		s7client.ConnectTo(ip, 0, 2, async function (err: any) {
			if (err) {
				//	logger.error(
				//		"error in machine.js 4 - " +
				//			request.machine +
				//			" - " +
				//			s7client.ErrorText(err)
				//	);
				reject({ machine: request.machine, err: s7client.ErrorText(err) });
				return;
			}

			let size = 242;
			if (line == 1 && request.machineType == "Lidder") {
				size = 50;
				//console.log("Lidder Line 1");
			}

			const returnedFaults = await ReadFaultsFromBPlusMachine(
				s7client,
				size,
				request
			);

			//destroy the s7client
			await s7client.Disconnect();

			resolve(returnedFaults);
			return;
		});
	});
	return promise;
}

function ReadFaultsFromBPlusMachine(
	s7client: snap7.S7Client,
	size: number,
	request: { machine: string; ip: string; line: number; machineType: string }
): Promise<any> {
	const promise = new Promise(function (resolve, reject) {
		s7client.DBRead(301, 16, size, function (err, res) {
			if (err) {
				//logger.error(
				//	"error in machine.js 5 - " +
				//		request.machine +
				//		" - " +
				//		s7client.ErrorText(err)
				//);
				// console.log("error reading from plc " + request.machine + " - " + s7client.ErrorText(err));
				reject({ machine: request.machine, err: s7client.ErrorText(err) });
				return;
			}

			//get the correct fault array
			const faultArray: string[] = getTheCorrectFaultListToUse(request);

			//use the correct fault array to get the correct fault names
			const tempArray = parseResultIntoFaultLog(res, request, faultArray);

			resolve(tempArray);
			return;
		});
	});
	return promise;
}
function parseResultIntoFaultLog(
	res: any,
	request: { machine: string; ip: string; line: number; machineType: string },
	faultArray: any[]
): number[] {
	const tempArray: number[] = [];
	for (let index = 0; index < 238 / 2; index++) {
		const element1 = res[index * 2];
		const element2 = res[index * 2 + 1];

		const faultHex = element1 + element2;

		const faultNumber = parseInt(faultHex, 16);
		const currentDBW = index * 2 + 16;

		if (request.machineType == "Lidder" && request.line == 1) {
			if (currentDBW > 52) {
				break;
			}
		}

		//console.log(request.machineType + " = " + request.line + " = " + faultArray[currentDBW] + " = " + faultNumber);
		tempArray[faultArray[currentDBW]] = faultNumber;
	}

	return tempArray;
}

function getTheCorrectFaultListToUse(request: {
	machine: string;
	ip: string;
	line: number;
	machineType: string;
}): string[] {
	let faultArray: string[] = [];

	if (request.machineType == "Lidder") {
		if (request.line == 1) faultArray = lidderFaultsLine1;
		else faultArray = lidderFaults;
	} else if (request.machineType == "iPack") faultArray = iPackFaults;
	return faultArray;
}

export default { getBPlusMachine };
