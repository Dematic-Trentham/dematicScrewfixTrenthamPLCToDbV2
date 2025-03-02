//import plc
import plc from "./../../misc/plc/plc.js";
import snap7Types from "./../../misc/plc/types.js";
//
import { autoCartonMachineType } from "@prisma/client";
import { addFaultsToDB } from "./faultAdder.js";

//make array of machines to store the faults
let machines: any = [];

async function getAndInsertFaults(
	ip: string,
	machineType: autoCartonMachineType,
	line: number,
	faults: any,
	boxCountDb: number,
	boxCountWord: number
) {
	//does the machine exist in the array
	let machineExists = false;

	//for each machine in the machines array check if the machine exists
	for (let m in machines) {
		//if the machine exists then set machineExists to true
		if (machines[m].machineType == machineType && machines[m].line == line) {
			machineExists = true;
			break;
		}
	}

	//if the machine does not exist then add it to the array
	if (!machineExists) {
		//time now for watchdog timer
		let timeNow = new Date();

		machines.push({
			watchDogTimer: timeNow,
			machineType: machineType,
			line: line,
			boxCount: 0,
			faults: JSON.parse(JSON.stringify(faults)),
		});
	}

	//get the index of the machine in the array
	let machineIndex = machines.findIndex(
		(machine: any) => machine.machineType == machineType && machine.line == line
	);

	let currentMachineFaults = machines[machineIndex].faults;

	let markerBytes = await plc.readFromS7Markers(ip, 0, 2, 0, 150);

	//loop through each fault and check if the bit is true
	for (let f in currentMachineFaults) {
		//get the bit value for the fault
		let bitValue = await plc.bufferToBit2(
			markerBytes,
			currentMachineFaults[f].location
		);

		//if the bit is true then insert the fault into the DB
		if (bitValue == true && currentMachineFaults[f].current == false) {
			await addFaultsToDB(machineType, currentMachineFaults[f].fault, line);
			//set current to true
			currentMachineFaults[f].current = true;

			//update the watchdog timer
			machines[machineIndex].watchDogTimer = new Date();
		}
	}
	//lets count the number of boxes and if we have a new box then insert into DB

	//read double word from PLC
	let doubleWordValue = await plc.readFromS7DBToInt2(
		ip,
		0,
		2,
		boxCountDb,
		boxCountWord,
		snap7Types.WordLen.S7WLDWord
	);

	// console.log("Checking box count for " + machineType + " " + line + "-" + doubleWordValue);

	//did the box count change
	if (machines[machineIndex].boxCount != doubleWordValue) {
		if (machines[machineIndex].boxCount != 0) {
			//repeat the insert to match the difference in box count
			let difference = doubleWordValue - machines[machineIndex].boxCount;

			//update the watchdog timer
			machines[machineIndex].watchDogTimer = new Date();

			for (let i = 0; i < difference; i++) {
				// console.log("Inserting box count for " + machineType + " " + line + "-" + doubleWordValue);
				await addFaultsToDB(machineType, "box", line);
			}
		}
		//update box count
		machines[machineIndex].boxCount = doubleWordValue;
	}
}

//if any of the machines in the array have not been updated in the last 60 seconds then insert a fault
setInterval(() => {
	//time now for watchdog timer
	let timeNow = new Date();

	//for each machine in the machines array check if the machine exists
	for (let m in machines) {
		//if the machine exists then set machineExists to true
		if (timeNow.getTime() - machines[m].watchDogTimer.getTime() > 60 * 1000) {
			addFaultsToDB(machines[m].machineType, "watchDog", machines[m].line);

			console.log(
				"Watchdog timer expired for " +
					machines[m].machineType +
					" " +
					machines[m].line
			);

			//reset the watchdog timer
			machines[m].watchDogTimer = timeNow;
		}
	}
}, 1000);

//export the function
export default { getAndInsertFaults };
