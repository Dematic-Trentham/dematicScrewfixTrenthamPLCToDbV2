//Service for Dematic Dashboard Screwfix trentham to read date from a PLC and push to DB
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:32:12
//Version: 0.0.1
import plc from "../../../misc/plc/plc.js";
import plcToDB from "../../../misc/plcToDB.js";

import snap7, { S7Client } from "node-snap7";

//import types
import snap7Types from "../../../misc/plc/types.js";
import db from "../../../db/db.js";

export type TPlcConfig = {
	ip: string;
	rack: number;
	slot: number;
	name: string;
};

export type TPlcArea = {
	name: string;
	location: string;
	subLocation: string;
	description: string;
	area: number;
	db: number;
	start: number;
	bit: number;
};

export async function readAndInsertSingle(
	plcConfig: TPlcConfig,
	plcArea: TPlcArea
) {
	//connect to plc
	const s7client = new snap7.S7Client();
	s7client.ConnectTo(
		plcConfig.ip,
		plcConfig.rack,
		plcConfig.slot,
		async function (err: any) {
			if (err) {
				console.log(
					"error for plc" + plcConfig.name + ": " + s7client.ErrorText(err)
				);
				return;
			}

			readAndInsertPlcData(s7client, plcConfig, plcArea);
			//disconnect from plc
			await s7client.Disconnect();
		}
	);
}

export async function readAndInsertMultiple(
	plcConfig: TPlcConfig,
	plcAreas: TPlcArea[]
) {
	//connect to plc
	const s7client = new snap7.S7Client();

	//console.log("Previous connection status: " + s7client.Connected());

	s7client.SetParam(snap7Types.ParamNumber.SendTimeout, 5000);
	s7client.SetParam(snap7Types.ParamNumber.RecvTimeout, 5000);
	s7client.SetParam(snap7Types.ParamNumber.PingTimeout, 5000);

	return new Promise<void>((resolve, reject) => {
		s7client.ConnectTo(
			plcConfig.ip,
			plcConfig.rack,
			plcConfig.slot,
			async function (err: any) {
				if (err) {
					console.log(
						"error for plc" + plcConfig.name + ": " + s7client.ErrorText(err)
					);
					reject(err);
					return;
				}

				//console.log("Connected to plc: " + s7client.Connected());

				try {
					await Promise.all(
						plcAreas.map(async (plcArea) => {
							await readAndInsertPlcData(s7client, plcConfig, plcArea);
						})
					);
					resolve();
				} catch (error) {
					reject(error);
				} finally {
					await s7client.Disconnect();
				}
			}
		);
	});
}

async function readAndInsertPlcData(
	s7client: snap7.S7Client,
	plcConfig: TPlcConfig,
	plcArea: TPlcArea
) {
	await s7client.ReadArea(
		plcArea.area,
		plcArea.db,
		plcArea.start,
		1,
		snap7Types.WordLen.S7WLByte,
		async function (err: any, buffer: Buffer) {
			if (err) {
				console.log(
					"error for plc" +
						plcConfig.name +
						": " +
						s7client.ErrorText(err) +
						" for area: " +
						plcArea.name
				);

				//console.log(s7client.Connected());
				return;
			}

			const byte = buffer.readUInt8(0);

			//convert byte into just the bit
			let bitValue = byte & (1 << plcArea.bit);
			bitValue = bitValue >> plcArea.bit;

			//console.log(
			//	"Data read from plc: " + bitValue + " for area: " + plcArea.name
			//);

			//insert data to DB if it does not exist else update
			await insertOrUpdateDataToDB(plcArea, bitValue.toString());
		}
	);
}

async function insertOrUpdateDataToDB(plcArea: TPlcArea, data: string) {
	const exists = await db.siteEMS.findUnique({
		where: {
			name: plcArea.name,
		},
	});

	//console.log("Data exists: " + exists + " for area: " + plcArea.name);

	if (exists) {
		//console.log("Updating data for area: " + plcArea.name);

		await db.siteEMS.update({
			where: {
				name: plcArea.name,
			},
			data: {
				value: data,
				lastUpdated: new Date(),
			},
		});
	} else {
		//console.log("Inserting data for area: " + plcArea.name);

		await db.siteEMS.create({
			data: {
				name: plcArea.name,
				location: plcArea.location,
				subLocation: plcArea.subLocation,
				description: plcArea.description,
				value: data,
			},
		});
	}
}
