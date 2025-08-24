//Service for Dematic Dashboard Screwfix trentham to read date from a PLC and push to DB
//Created by: JWL
//Date: 2023/02/03 03:38:36
//Last modified: 2024/10/26 10:32:12
//Version: 0.0.1
import snap7 from "node-snap7";

//import types
import snap7Types from "../../../misc/plc/types.js";
import db from "../../../db/db.js";
import logger from "../../../misc/logging.js";

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
				logger.error(
					"error for plc1 " + plcConfig.name + ": " + s7client.ErrorText(err)
				);
				return;
			}

			await readAndInsertPlcData(s7client, plcConfig, plcArea);
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

	//logger.error("Previous connection status: " + s7client.Connected());

	s7client.SetParam(snap7Types.ParamNumber.SendTimeout, 5000);
	s7client.SetParam(snap7Types.ParamNumber.RecvTimeout, 5000);
	s7client.SetParam(snap7Types.ParamNumber.PingTimeout, 5000);

	return new Promise<void>((resolve, reject) => {
		const s7client = new snap7.S7Client();
		s7client.ConnectTo(
			plcConfig.ip,
			plcConfig.rack,
			plcConfig.slot,
			async function (err: any) {
				if (err) {
					logger.error(
						"error for " + plcConfig.name + ": " + s7client.ErrorText(err)
					);
					reject(err);
					await s7client.Disconnect();
					return;
				}

				logger.info("Reading " + plcConfig.name + " EMS data - connected");

				await s7client.MBRead(1, 200, async function (err: any, res: any) {
					if (err) {
						logger.error(
							"error for " + plcConfig.name + ": " + s7client.ErrorText(err)
						);
						await s7client.Disconnect();
						reject(err);
						return;
					}

					//for each item in the items array
					for (let i = 0; i < plcAreas.length; i++) {
						//get the current item
						const item = plcAreas[i];
						try {
							//get the value from the plc data
							const byte = res[item.start - 1];

							//get the bit from the plc data
							const value = (byte >> item.bit) & 1;

							//insert the value into the db
							await insertOrUpdateDataToDB(item, value.toString());
						} catch (error) {
							logger.error(
								`Error inserting data for area ${item.name}:`,
								error
							);
							await s7client.Disconnect();
							reject(error);
							return;
						}
					}

					//disconnect from plc
					await s7client.Disconnect();

					resolve();
				});
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
			logger.error(
				"Reading data from plc3: " +
					plcConfig.name +
					" for area: " +
					plcArea.name
			);

			if (err) {
				logger.error(
					"error for plc3 " +
						plcConfig.name +
						": " +
						s7client.ErrorText(err) +
						" for area: " +
						plcArea.name
				);

				//logger.error(s7client.Connected());
				return;
			}

			const byte = buffer.readUInt8(0);

			//convert byte into just the bit
			let bitValue = byte & (1 << plcArea.bit);
			bitValue = bitValue >> plcArea.bit;

			logger.error(
				"Data read from plc5 : " + bitValue + " for area: " + plcArea.name
			);

			//insert data to DB if it does not exist else update
			await insertOrUpdateDataToDB(plcArea, bitValue.toString());
		}
	);
}

export async function insertOrUpdateDataToDB(plcArea: TPlcArea, data: string) {
	const exists = await db.siteEMS.findUnique({
		where: {
			name: plcArea.name,
		},
	});

	if (exists) {
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
