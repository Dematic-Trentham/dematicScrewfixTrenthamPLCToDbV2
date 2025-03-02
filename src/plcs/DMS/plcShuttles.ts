//Service for Dematic Dashboard Screwfix trentham to read date from Multishuttle aisles
//Created by: JWL
//Date: 2023/02/03 05:21:36
//Last modified: 2024/09/06 16:33:36
//Version: 0.0.1

import plcShuttlesLocations from "./plcShuttlesLocations.js";
import plcShuttlesFaults from "./plcShuttleFaults.js";

async function readShuttlesLocations() {
  plcShuttlesLocations.readShuttlesToDB();
}
async function readShuttlesFaults() {
  plcShuttlesFaults.readShuttlesFaults();
}

export default { readShuttlesLocations, readShuttlesFaults };
