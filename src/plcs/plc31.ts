//Service for Dematic Dashboard Screwfix trentham to read date from PLC 31 - Order Start
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2023/03/05 19:10:56
//Version: 0.0.1

import plcToDB from "./../misc/plcToDB.js";

//import types
import snap7Types from "./../misc/plc/types.js";

//function to be run from the main program every 10 seconds
//this function will read the data from the PLC and store it in the database
async function readDataFromPLC31TenSeconds() {
  let ip = "10.4.2.27"; //IP address of the PLC
  let rack = 0; //Rack number of the PLC
  let slot = 3; //Slot number of the PLC.

  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 30, plcToDB.DataType.Word, "dematic_dashboard_PLC31_carton_erector_1");
  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 50, plcToDB.DataType.Word, "dematic_dashboard_PLC31_carton_erector_2");
  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 70, plcToDB.DataType.Word, "dematic_dashboard_PLC31_carton_erector_3");
  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 90, plcToDB.DataType.Word, "dematic_dashboard_PLC31_carton_erector_4");
  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 110, plcToDB.DataType.Word, "dematic_dashboard_PLC31_carton_erector_5");
  await plcToDB.plcToDB(ip, rack, slot, snap7Types.Area.S7AreaDB, 145, 10, plcToDB.DataType.Word, "dematic_dashboard_PLC31_OrderTotes");
}

//export the function
export default { readDataFromPLC31TenSeconds };
