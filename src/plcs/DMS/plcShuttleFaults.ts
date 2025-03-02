//Service for Dematic Dashboard Screwfix trentham to read faults from Multishuttle aisles
//Created by: JWL
//Date: 2023/02/03 05:21:36
//Last modified: 2024/09/12 17:02:57
//Version: 0.0.1

import { getParameterFromDB } from "../../misc/getParameterFromDB.js";
import plc from "../../misc/plc/plc.js";
import snap7 from "node-snap7";
import db from "../../db/db.js";

type currentFault = {
  location: string;
  fault: string;
  id: string;
  stillActive: boolean;
};

//currently in fault array
let currentlyInFaultArray: { [key: string]: currentFault } = {};

//currently running
let functionCurrentlyRunning = false;

async function readShuttlesFaults() {
  if (functionCurrentlyRunning) {
    console.log("Function already running");
    return;
  }

  functionCurrentlyRunning = true;

  //console.log("Reading Shuttles Faults");

  await checkDbForFaults();

  functionCurrentlyRunning = false;
}

async function checkDbForFaults() {
  //lets get the parameters from the database for the amount of aisles and levels
  const amountOfAislesResult = await getParameterFromDB("dmsAmountOfAisles");
  const amountOfLevelsResult = await getParameterFromDB("dmsAmountOfLevels");
  const aisleBaseIPResult = await getParameterFromDB("dmsAisleBaseIP");
  const aisleIPOffsetResult = await getParameterFromDB("dmsAisleIPOffset");
  const dmsAisleFaultDBResult = await getParameterFromDB("dmsAisleFaultDB");

  const amountOfAisles = parseInt(amountOfAislesResult);
  const amountOfLevels = parseInt(amountOfLevelsResult);
  const aisleIPoffset = parseInt(aisleIPOffsetResult);
  const dmsAisleFaultDB = parseInt(dmsAisleFaultDBResult);

  //set all faults to not active
  for (let location in currentlyInFaultArray) {
    currentlyInFaultArray[location].stillActive = false;
  }

  for (var aisle = 1; aisle < amountOfAisles + 1; aisle++) {
    //console.log(aisle);
    //Loop through the 3 aisles
    await checkAisleDBForFaults(aisle, amountOfLevels, aisleBaseIPResult, aisleIPoffset, dmsAisleFaultDB);
  }

  checkIfFaultsAreStillActive();

  return true;
}

async function checkAisleDBForFaults(aisle: number, amountOfLevels: number, aisleBaseIP: string, aisleIPOffset: number, dmsFaultDB: number) {
  let DBFaults = 2050;

  return new Promise((resolve, reject) => {
    //length of each fault
    let lengthOfFault = 28;

    //total length of all faults
    let totalLength = lengthOfFault * 1000;

    //add 2 for the amount of faults
    totalLength = totalLength + 2;

    const ip = aisleBaseIP.toString() + (aisleIPOffset + aisle).toString().padStart(3, "0");

    //connect to the plc
    plc
      .readFromS7DbRAW(ip, 0, 1, DBFaults, 0, totalLength)
      .then(async (result) => {
        //get the amount of faults
        let amountOfFaults = s72BytesToNumber(result[0], result[1]);

        // console.log("Amount of faults: " + amountOfFaults);

        //if we dont have any faults, return
        if (amountOfFaults == 0) {
          resolve("No faults");
          return;
        }

        //for each fault
        for (let faultIndex = 0; faultIndex < amountOfFaults; faultIndex++) {
          let offset = 2 + faultIndex * lengthOfFault;

          let faultCode = s72BytesToNumber(result[offset + 18], result[offset + 18 + 1]).toString();

          //console.log("Fault code:@@ " + faultCode);

          //what location is this fault on?
          let location = s72BytesToNumber(result[offset + 0], result[offset + 0 + 1]).toString();

          //add the aisle to the location
          location = aisle + "-" + location;

          //console.log("Location: " + location);

          //check if we are already in fault
          if (currentlyInFaultArray[location] == undefined) {
            //we are not in fault, add to the array
            currentlyInFaultArray[location] = {
              location: location,
              fault: "false",
              id: "",
              stillActive: true,
            };
          }

          //is this shuttle already in fault?
          if (currentlyInFaultArray[location].fault == faultCode) {
            //console.log("Shuttle is already in same fault");
          } else {
            //were we in a different fault before?
            if (currentlyInFaultArray[location].fault != "false") {
              // console.log("Shuttle was in fault before, now different fault");
              await addFaultIntoDB(aisle, location, faultCode, ip);
            } else {
              //  console.log("Shuttle was not in fault before, now in fault");

              //build sql query to insert the fault into the database

              await addFaultIntoDB(aisle, location, faultCode, ip);
            }

            //set that this shuttle is in fault
            currentlyInFaultArray[location].fault = faultCode;
          }

          currentlyInFaultArray[location].stillActive = true;

          //console.log(currentlyInFault[location]);
        }

        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

async function checkIfFaultsAreStillActive() {
  //for each location in currentlyInFault
  for (let location in currentlyInFaultArray) {
    console.log(currentlyInFaultArray[location]);

    //if this fault is still active
    if (currentlyInFaultArray[location].stillActive == false) {
      // console.log("Fault is no longer active " + location + " - " + currentlyInFault[location].fault);

      //reset the fault
      currentlyInFaultArray[location].fault = "false";

      db.dmsShuttleFaultLogs.update({
        where: {
          ID: currentlyInFaultArray[location].id.toString(),
        },
        data: {
          resolvedTimestamp: new Date(),
          resolvedReason: "automatic",
        },
      });

      //remove the fault from the array
      delete currentlyInFaultArray[location];
    }
  }
}

clearAllFaults();
//when starting, clear all faults in the db that are not resolved, "with a resolved timestamp"
async function clearAllFaults() {
  db.dmsShuttleFaultLogs.updateMany({
    where: {
      resolvedReason: "",
    },
    data: {
      resolvedTimestamp: new Date(),
      resolvedReason: "automatic",
    },
  });
  console.log("Cleared all dms faults in db");
}

async function addFaultIntoDB(aisle: number, location: string, fault: string, ip: string) {
  //is the location a shuttle , starts with 19
  if (!location.split("-")[1].startsWith("19")) {
    return;
  }

  let offsetDBFaults = 78;
  let levelPart = location.split("-")[1];

  //get the level last 2 digits
  let level = parseInt(levelPart.substring(levelPart.length - 2, levelPart.length));
  let startOffset = (level - 1) * offsetDBFaults;

  console.log("Level part: " + levelPart);

  try {
    //shuttle is in fault, get the info from the plc
    let data = await plc.readFromS7DbRAW(ip, 0, 1, 836, startOffset, offsetDBFaults);

    let macArray = await getShuttleData(aisle, level, ip);

    let xCoordinate = await getTheShuttleXCoordinate(aisle, level, ip);

    //lets make an array of the faults
    let faults: Record<string, string | number | boolean> = {};

    faults["LocalAisle"] = aisle.toString();
    faults["LocalLevel"] = level.toString();

    faults["aisle"] = data[0];
    faults["level"] = data[1];

    faults["mac"] = macArray["mac"];

    createShuttleMode(data, faults);
    createShuttleStatus(faults, data);
    createLoadStatus(faults, data);
    createPositionStatus(faults, data);
    createFingerStatus(faults, data);

    faults["RawOP"] = data[8];

    createOperationNotifications(faults, data);

    faults["rawFaultGroup"] = data[9];
    faults["rawFaultNumber"] = data[10];

    createFaults(faults, data);

    createOrderStep(faults, data);

    faults["activeOrderID"] = data[12];
    faults["waitingOrderID"] = data[13];

    faults["currentX_pos"] = s74BytesToNumber(data[16], data[17], data[18], data[19]);
    faults["currentX_speed"] = s72BytesToNumber(data[20], data[21]);

    faults["currentW_pos"] = s72BytesToNumberSigned(data[22], data[23]);
    faults["currentW_speed"] = s72BytesToNumber(data[24], data[25]);

    // currentZ1_pos is a 2 byte signed int
    faults["currentZ1_pos"] = s72BytesToNumberSigned(data[26], data[27]);

    faults["currentZ1_speed"] = s72BytesToNumber(data[28], data[29]);

    faults["currentZ2_pos"] = s72BytesToNumber(data[30], data[31]);
    faults["currentZ2_speed"] = s72BytesToNumber(data[32], data[33]);

    const shuttleID = await db.dmsShuttleLocations.findFirst({
      where: {
        macAddress: faults["mac"].toString(),
      },
    });

    if (faults["mac"] == null || shuttleID == null) {
      return;
    }

    const result = await db.dmsShuttleFaultLogs.create({
      data: {
        timestamp: new Date(),
        aisle: aisle,
        level: level,
        macAddress: faults["mac"].toString(),
        shuttleID: shuttleID.shuttleID,
        faultCode: fault,
        xLocation: faults["currentX_pos"],
        ZLocation: faults["currentZ1_pos"],
        WLocation: faults["currentW_pos"],
        resolvedReason: "",
        resolvedTimestamp: new Date(),
        xCoordinate: xCoordinate.xCord,
        rawInfo: JSON.stringify(faults),
      },
    });

    console.log(result);

    //update the id of the fault in the array
    currentlyInFaultArray[location].id = result.ID;
  } catch (error) {
    console.log("Error in addFaultIntoDB");
    console.log(error);
  }
}

function getShuttleData(aisle: number, level: number, ip: string) {
  return new Promise<any>(function (resolve, reject) {
    let plcConnection = new snap7.S7Client();

    plcConnection.ConnectTo(ip, 0, 1, async function (err) {
      if (err) reject(plcConnection.ErrorText(err));

      plcConnection.ReadArea(0x84, 2850 + level, 1528, 8, 0x02, function (err, data) {
        if (err) reject(plcConnection.ErrorText(err));

        let tempArray = {
          aisle: aisle,
          level: level,
          mac: stringToCapital(toHexString(data)),
        };
        resolve(tempArray);
      });
    });

    //return promise;
  });
}

function getTheShuttleXCoordinate(aisle: number, level: number, ip: string) {
  return new Promise<any>(function (resolve, reject) {
    let plcConnection = new snap7.S7Client();

    //console.log("Connecting to here");

    plcConnection.ConnectTo(ip, 0, 1, async function (err) {
      if (err) reject(plcConnection.ErrorText(err) + ":(2");

      //caculate the offset to the x coordinate
      let starting = 36418;
      let next = 36694;

      let different = next - starting;

      let offset = starting + (level - 1) * different;

      plcConnection.ReadArea(0x84, 2013, offset, 1, 4, function (err, data) {
        if (err) reject(plcConnection.ErrorText(err) + ":(");

        //  console.log(data);

        let tempArray = {
          aisle: aisle,
          level: level,
          xCord: s72BytesToNumber(data[0], data[1]),
        };

        //console.log("here 2");
        resolve(tempArray);
      });
    });
  });
}

function createOrderStep(faults: Record<string, string | number | boolean>, data: Buffer) {
  faults["orderStep"] = data[11];
  //0 = no order, 1 = order running, 2 = order finished, 3 = order aborted
  switch (data[11]) {
    case 1:
      faults["orderStep"] = "Order running";
      break;
    case 2:
      faults["orderStep"] = "Order finished";
      break;
    case 3:
      faults["orderStep"] = "Order aborted";
      break;
    default:
      faults["orderStep"] = "No order";
      break;
  }
}

function createShuttleMode(data: Buffer, faults: Record<string, string | number | boolean>) {
  //faults["mode"] = data[2];
  //if the mode is 1 then we are in auto mode, 2 is manual mode
  if (data[2] == 1) {
    faults["mode"] = "Auto";
  } else if (data[2] == 2) {
    faults["mode"] = "Manual";
  }
}

function createFaults(faults: Record<string, string | number | boolean>, data: Buffer) {
  faults["faultGroup"] = data[9];
  faults["faultNumber"] = data[10];

  // 25	System faults
  // 26	General faults
  // 27	X axis faults
  // 28	Z1 axis faults
  // 29	Z2 axis faults
  // 30	W axis faults
}

function createOperationNotifications(faults: Record<string, string | number | boolean>, data: Buffer) {
  faults["operatingNotification"] = data[8];

  //1	Automatic order in manual mode not allowed
  // 2	Manual order in automatic mode not allowed
  // 3	Manual order not allowed, another axis is already running
  // 4	New order but shuttle is faulted
  // 5	Telescope is not in center position
  // 6	X-Axis is not in position
  // 7	Fingers are not in position
  // 8	Axes are not ready
  // 9	X-Axis is not taught
  // 11	Order data are not complete
  // 51	Homing, but homing still active
  // 52	Teaching, but teaching still active
  // 53	Teaching, but down-loading still active
  // 54	Positioning, but positioning still active
  // 55	Pick, but pick still active
  // 56	Drop, but drop still active
  // 57	Shift, but shift still active

  switch (data[8]) {
    case 1:
      faults["operatingNotification"] = "Automatic order in manual mode not allowed";
      break;
    case 2:
      faults["operatingNotification"] = "Manual order in automatic mode not allowed";
      break;
    case 3:
      faults["operatingNotification"] = "Manual order not allowed, another axis is already running";
      break;
    case 4:
      faults["operatingNotification"] = "New order but shuttle is faulted";
      break;
    case 5:
      faults["operatingNotification"] = "Telescope is not in center position";
      break;
    case 6:
      faults["operatingNotification"] = "X-Axis is not in position";
      break;
    case 7:
      faults["operatingNotification"] = "Fingers are not in position";
      break;
    case 8:
      faults["operatingNotification"] = "Axes are not ready";
      break;
    case 9:
      faults["operatingNotification"] = "X-Axis is not taught";
      break;
    case 11:
      faults["operatingNotification"] = "Order data are not complete";
      break;
    case 51:
      faults["operatingNotification"] = "Homing, but homing still active";
      break;
    case 52:
      faults["operatingNotification"] = "Teaching, but teaching still active";
      break;
    case 53:
      faults["operatingNotification"] = "Teaching, but down-loading still active";
      break;
    case 54:
      faults["operatingNotification"] = "Positioning, but positioning still active";
      break;
    case 55:
      faults["operatingNotification"] = "Pick, but pick still active";
      break;
    case 56:
      faults["operatingNotification"] = "Drop, but drop still active";
      break;
    case 57:
      faults["operatingNotification"] = "Shift, but shift still active";
      break;
    default:
      faults["operatingNotification"] = "No operating notification";
      break;
  }
}

function createFingerStatus(faults: Record<string, string | number | boolean | any>, data: Buffer) {
  faults["fingerStatus"] = {};
  faults["fingerStatus"]["fingerUpStatus"] = {};
  //bit0 = pair 1 up, bit1 = pair 2 up, bit2 = pair 3 up, bit3 = pair 4 up
  //turn byte into bits
  let fingerUpStatus = data[6].toString(2).padStart(8, "0");
  faults["fingerStatus"]["fingerUpStatus"].pair1 = fingerUpStatus[7] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerUpStatus"].pair2 = fingerUpStatus[6] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerUpStatus"].pair3 = fingerUpStatus[5] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerUpStatus"].pair4 = fingerUpStatus[4] === "1" ? "Yes" : "No";

  faults["fingerStatus"]["fingerDownStatus"] = {};
  //bit0 = pair 1 down, bit1 = pair 2 down, bit2 = pair 3 down, bit3 = pair 4 down
  //turn byte into bits
  let fingerDownStatus = data[7].toString(2).padStart(8, "0");
  faults["fingerStatus"]["fingerDownStatus"].pair1 = fingerDownStatus[7] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerDownStatus"].pair2 = fingerDownStatus[6] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerDownStatus"].pair3 = fingerDownStatus[5] === "1" ? "Yes" : "No";
  faults["fingerStatus"]["fingerDownStatus"].pair4 = fingerDownStatus[4] === "1" ? "Yes" : "No";
}

function createPositionStatus(faults: Record<string, string | number | boolean | any>, data: Buffer) {
  faults["positionStatus"] = {};
  //bit0 = x positioned on target, bit1 = z centered, bit3 = w positioned on target
  let positionStatus = data[5].toString(2).padStart(8, "0");
  faults["positionStatus"].xPositioned = positionStatus[7] === "1" ? "Yes" : "No";
  faults["positionStatus"].zCentered = positionStatus[6] === "1" ? "Yes" : "No";
  faults["positionStatus"].wPositioned = positionStatus[4] === "1" ? "Yes" : "No";
}

function createLoadStatus(faults: Record<string, string | number | boolean | any>, data: Buffer) {
  faults["loadStatus"] = {};
  //0 = not loaded, bit0 = sensor 1 blocked, bit1 = sensor 2 blocked
  //turn byte into bits
  let loadStatus = data[4].toString(2).padStart(8, "0");

  //console.log(loadStatus);
  //if the bit is 1 then the shuttle is configured
  faults["loadStatus"].loaded = loadStatus[7] === "1" ? "Yes" : "No";
  faults["loadStatus"].sensor1Blocked = loadStatus[0] === "1" ? "Yes" : "No";
  faults["loadStatus"].sensor2Blocked = loadStatus[1] === "1" ? "Yes" : "No";
}

function createShuttleStatus(faults: Record<string, string | number | boolean | any>, data: Buffer) {
  faults["shuttleStatus"] = {};
  //shuttle status - bit0 = configured, bit1 = homed, bit2 = taught, bit3 = on lift, bit5 = maint v
  //turn byte into bits
  let shuttleStatus = data[3].toString(2).padStart(8, "0");
  faults["shuttleStatus"].configured = shuttleStatus[7] === "1" ? "Yes" : "No";
  faults["shuttleStatus"].homed = shuttleStatus[6] === "1" ? "Yes" : "No";
  faults["shuttleStatus"].taught = shuttleStatus[5] === "1" ? "Yes" : "No";
  faults["shuttleStatus"].onLift = shuttleStatus[4] === "1" ? "Yes" : "No";
  faults["shuttleStatus"].maintMode = shuttleStatus[2] === "1" ? "Yes" : "No";
}

//s7 dint to number
function s7DintToNumber(buffer: Buffer) {
  //convert the buffer to a number
  let value = buffer.readInt32BE();

  //return the value
  return value;
}

function s72BytesToNumberSigned(byte1: number, byte2: number) {
  //combine the bytes and read as readUInt32BE
  //make into buffer
  const buffer = Buffer.from([byte1, byte2]);

  return buffer.readInt16BE(0);
}

//s7 dint to number
function s74BytesToNumber(byte1: number, byte2: number, byte3: number, byte4: number) {
  //combine the bytes and read as readUInt32BE
  //make into buffer
  const buffer = Buffer.from([byte1, byte2, byte3, byte4]);

  return buffer.readUInt32BE();
}

//s7 dint to number
function s72BytesToNumber(byte1: number, byte2: number) {
  //combine the bytes and read as readUInt32BE
  //make into buffer
  const buffer = Buffer.from([byte1, byte2]);

  return buffer.readUInt16BE();
}

//s7 byte to number
function s7ByteToNumber(buffer: Buffer) {
  //convert the buffer to a number
  let value = buffer.readInt8();

  //return the value
  return value;
}

export default { readShuttlesFaults };
function paddy(num: string, padlen: number, padchar?: string) {
  var pad_char = typeof padchar !== "undefined" ? padchar : "0";
  var pad = new Array(1 + padlen).join(pad_char);
  return (pad + num).slice(-pad.length);
}

function stringToCapital(string: string) {
  return string.toUpperCase();
}

function toHexString(byteArray: Buffer) {
  if (byteArray == null || byteArray.length == 0) return "";
  if (byteArray.length == 0) return "";
  var result = "";

  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join(" ");
}
