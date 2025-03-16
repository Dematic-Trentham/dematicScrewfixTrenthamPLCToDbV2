//import plc
import plc from "./../../misc/plc/plc.js";
import snap7Types from "./../../misc/plc/types.js";
//
type autoCartonMachineType = "erector" | "Lidder" | "iPack";
import { addFaultsToDB } from "./faultAdder.js";

//make array of machines to store the faults
interface Machine {
	watchDogTimer: Date;
	machineType: autoCartonMachineType;
	line: number;
	boxCount: number;
	faults: { fault: string; location: string; current: boolean }[];
	connected: boolean;
}

const machines: Machine[] = [];

async function getAndInsertFaults(
	ip: string,
	machineType: autoCartonMachineType,
	line: number,
	faults: { fault: string; location: string; current: boolean }[],
	boxCountDb: number,
	boxCountWord: number,

	version: string = "S7"
) {
	let slot = 0;
	//slot number for PLC
	if (version == "S7") {
		slot = 2;
	} else if (version == "TIA") {
		slot = 1;
	}

	//does the machine exist in the array
	let machineExists = false;

	//for each machine in the machines array check if the machine exists
	for (const m of machines) {
		//if the machine exists then set machineExists to true
		if (m.machineType == machineType && m.line == line) {
			machineExists = true;
			break;
		}
	}

	//if the machine does not exist then add it to the array
	if (!machineExists) {
		//time now for watchdog timer
		const timeNow = new Date();

		machines.push({
			watchDogTimer: timeNow,
			machineType: machineType,
			line: line,
			boxCount: 0,
			faults: JSON.parse(JSON.stringify(faults)),
			connected: false,
		});
	}

	//get the index of the machine in the array
	const machineIndex = machines.findIndex(
		(machine: { machineType: autoCartonMachineType; line: number }) =>
			machine.machineType == machineType && machine.line == line
	);

	const currentMachineFaults = machines[machineIndex].faults;

	//set connected to false
	machines[machineIndex].connected = false;

	const markerBytes = await plc.readFromS7Markers(ip, 0, slot, 0, 150);

	//check if the machine is connected
	if (markerBytes != null) {
		machines[machineIndex].connected = true;
	}

	//loop through each fault and check if the bit is true
	for (const f of currentMachineFaults) {
		//get the bit value for the fault
		const bitValue = await plc.bufferToBit2(markerBytes, f.location);

		//if the bit is true then insert the fault into the DB
		if (bitValue == true && f.current == false) {
			await addFaultsToDB(machineType, f.fault, line);
			//set current to true
			f.current = true;

			//update the watchdog timer
			machines[machineIndex].watchDogTimer = new Date();
		}
	}
	//lets count the number of boxes and if we have a new box then insert into DB

	//read double word from PLC
	const doubleWordValue = await plc.readFromS7DBToInt2(
		ip,
		0,
		slot,
		boxCountDb,
		boxCountWord,
		snap7Types.WordLen.S7WLDWord
	);

	// console.log("Checking box count for " + machineType + " " + line + "-" + doubleWordValue);

	//did the box count change
	if (machines[machineIndex].boxCount != doubleWordValue) {
		if (machines[machineIndex].boxCount != 0) {
			//repeat the insert to match the difference in box count
			const difference = doubleWordValue - machines[machineIndex].boxCount;

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

//export the function
export default { getAndInsertFaults };
