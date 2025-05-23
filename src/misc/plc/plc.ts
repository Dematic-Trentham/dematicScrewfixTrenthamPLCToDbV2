//Service for Dematic Dashboard Screwfix trentham to read date from PLCs
//Created by: JWL
//Date: 2023/02/02 21:27:41
//Last modified: 2024/09/06 12:49:55
//Version: 0.0.1

import snap7 from "node-snap7";
import snap7Types from "./types.js";

import plc from "./plc.js";
import logger from "../logging.js";

//enum for the different types of data that can be read from the PLC
enum DataType {
	Bit = 1,
	Byte = 2,
	Word = 3,
	DWord = 4,
	real = 5,
	timer = 6,
	counter = 7,
}

async function readFromS7DbRAW(
	ipAddress: string,
	rack: number,
	slot: number,
	dbNumber: number,
	offset: number,
	length: number
) {
	return new Promise<Buffer>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					//logger.error("error: " + s7client.ErrorText(err));
					reject("error in plc.ts: 1" + s7client.ErrorText(err));
					return;
				}

				s7client.DBRead(dbNumber, offset, length, function (err, buffer) {
					if (err) {
						reject(s7client.ErrorText(err));
						return;
					}

					try {
						// Disconnect from the PLC
						s7client.Disconnect();
						resolve(buffer);
					} catch (error) {
						//logger.error(error);
						reject(error);
						return;
					}
				});
			});
		} catch (error) {
			//logger.error(error);
			reject(error);
			return;
		}
	});
}

//read from a DB and convert to int
async function readFromS7DBToInt(
	ipAddress: string,
	rack: number,
	slot: number,
	dbNumber: number,
	offset: number,
	length: DataType
) {
	return new Promise<number>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					//	logger.error("error in plc.ts: " + s7client.ErrorText(err));
					reject("error in plc.ts: 2" + s7client.ErrorText(err));
					return;
				}

				switch (length) {
					case DataType.Bit:
						//split the marker and bit by (.)

						// eslint-disable-next-line no-case-declarations
						const marker = parseInt(offset.toString().split(".")[0]);

						// eslint-disable-next-line no-case-declarations
						const bit = parseInt(offset.toString().split(".")[1]);

						plc
							.readFromS7DBToBit(ipAddress, rack, slot, dbNumber, marker, bit)
							.then((result) => {
								resolve(result);
							})
							.catch((err) => {
								reject(err);
							});

						break;

					case DataType.Byte:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLByte,
							function (err, buffer) {
								if (err) {
									reject(s7client.ErrorText(err));

									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt8(0);
									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 1 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);
									return;
								}
							}
						);
						break;

					case DataType.Word:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLWord,
							function (err, buffer) {
								if (err) {
									reject("error in plc.ts: 2" + s7client.ErrorText(err));
									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt16BE(0);

									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 3 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);
									return;
								}
							}
						);
						break;

					case DataType.DWord:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLDWord,
							function (err, buffer) {
								if (err) {
									reject(
										"error in plc.ts 4 " +
											ipAddress +
											": " +
											s7client.ErrorText(err)
									);
									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt32BE(0);

									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 5 " +
											ipAddress +
											":" +
											error +
											": " +
											s7client.ErrorText(err)
									);
									return;
								}
							}
						);
						break;
				}
			});
		} catch (error) {
			reject("error in plc.ts 6 " + ipAddress + ": " + error);
			return;
		}
	});
}

//read a bit from a DB
async function readFromMakerByte(
	ipAddress: string,
	rack: number,
	slot: number,
	marker: number
) {
	return new Promise<number>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					reject(
						"error in plc.ts 7 " + ipAddress + ": " + s7client.ErrorText(err)
					);

					return;
				}

				// Read the data from the PLC
				s7client.ReadArea(
					snap7Types.Area.S7AreaMK,
					0,
					marker,
					1,
					snap7Types.WordLen.S7WLByte,
					function (err, buffer) {
						if (err) {
							reject(
								"error in plc.ts 8 " +
									ipAddress +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}

						try {
							// Disconnect from the PLC
							s7client.Disconnect();

							resolve(buffer.readUInt8(0));
						} catch (error) {
							reject(
								"error in plc.ts 9 " +
									ipAddress +
									":" +
									error +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}
					}
				);
			});
		} catch (error) {
			reject("error in plc.ts 10 " + ipAddress + ": " + error);

			return;
		}
	});
}

//read a bit from a Marker
async function readFromMarkerBit(
	ipAddress: string,
	rack: number,
	slot: number,
	marker: number,
	bit: number
) {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<number>(async (resolve, reject) => {
		try {
			const byte = await readFromMakerByte(ipAddress, rack, slot, marker);

			//get the bit value from the byte

			let bitValue = byte & (1 << bit);
			bitValue = bitValue >> bit;

			resolve(bitValue);
		} catch (error) {
			reject("error in plc.ts 11 " + ipAddress + ": " + error);

			return;
		}
	});
}

//read a bit from a Marker
async function readFromMarkerBitNotSplit(
	ipAddress: string,
	rack: number,
	slot: number,
	markerAndBit: string
) {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<number>(async (resolve, reject) => {
		//split the marker and bit by (.)
		const marker = parseInt(markerAndBit.toString().split(".")[0]);
		const bit = parseInt(markerAndBit.toString().split(".")[1]);
		try {
			const bitValue = await readFromMarkerBit(
				ipAddress,
				rack,
				slot,
				marker,
				bit
			);

			resolve(bitValue);
		} catch (error) {
			reject("error in plc.ts 12 " + ipAddress + ": " + error);

			return;
		}
	});
}

//read bit from a DB
async function readFromS7DBToBit(
	ipAddress: string,
	rack: number,
	slot: number,
	dbNumber: number,
	offset: number,
	bit: number
) {
	return new Promise<number>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					reject("error in plc.ts 13 " + ipAddress + ": ");

					return;
				}

				// Read the data from the PLC
				s7client.ReadArea(
					snap7Types.Area.S7AreaDB,
					dbNumber,
					offset,
					1,
					snap7Types.WordLen.S7WLByte,
					function (err, buffer) {
						if (err) {
							reject(
								"error in plc.ts 14 " +
									ipAddress +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}

						try {
							// Disconnect from the PLC
							s7client.Disconnect();

							let bitValue = buffer.readUInt8(0) & (1 << bit);
							bitValue = bitValue >> bit;

							resolve(bitValue);
						} catch (error) {
							reject("error in plc.ts 15 " + ipAddress + ": " + error);

							return;
						}
					}
				);
			});
		} catch (error) {
			reject("error in plc.ts 16 " + ipAddress + ": " + error);

			return;
		}
	});
}

//read from a DB and convert to int
async function readFromS7DBToInt2(
	ipAddress: string,
	rack: number,
	slot: number,
	dbNumber: number,
	offset: number,
	length: DataType
) {
	return new Promise<number>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					reject(
						"error in plc.ts 17 " + ipAddress + ": " + s7client.ErrorText(err)
					);

					return;
				}

				switch (length) {
					case snap7Types.WordLen.S7WLByte:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLByte,
							function (err, buffer) {
								if (err) {
									reject(s7client.ErrorText(err));

									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt8(0);
									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 18 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);

									return;
								}
							}
						);
						break;

					case snap7Types.WordLen.S7WLWord:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLWord,
							function (err, buffer) {
								if (err) {
									reject(
										"error in plc.ts 19a " +
											ipAddress +
											": " +
											s7client.ErrorText(err)
									);
									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt16BE(0);

									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 19 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);

									return;
								}
							}
						);
						break;

					case snap7Types.WordLen.S7WLDWord:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLDWord,
							function (err, buffer) {
								if (err) {
									reject(
										"error in plc.ts 20 " +
											ipAddress +
											": " +
											s7client.ErrorText(err) +
											"trying to read from: " +
											ipAddress +
											" db: " +
											dbNumber +
											" offset: " +
											offset +
											" length: " +
											length
									);

									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const int = buffer.readUInt32BE(0);

									// Return the buffer
									resolve(int);
								} catch (error) {
									reject(
										"error in plc.ts 21 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);

									return;
								}
							}
						);
						break;

					case snap7Types.WordLen.S7WLTimer:
						// Read the data from the PLC
						s7client.ReadArea(
							snap7Types.Area.S7AreaDB,
							dbNumber,
							offset,
							1,
							snap7Types.WordLen.S7WLWord,
							function (err, buffer) {
								if (err) {
									reject(
										"error in plc.ts 22 " +
											ipAddress +
											": " +
											s7client.ErrorText(err)
									);

									return;
								}

								try {
									// Disconnect from the PLC
									s7client.Disconnect();

									const hex = bytesToHexString(buffer);
									let main = parseInt(hex.substring(1, 4));

									switch (hex.substring(0, 1)) {
										case "0":
											main = main / 100;
											break;
										case "1":
											main = main / 10;
											break;
										case "2":
											main = main / 1;
											break;
										case "3":
											main = main / 0.1;
											break;
									}

									logger.error(main);
									logger.error("hummmmmm");
									// Return the buffer
									resolve(main);
								} catch (error) {
									reject(
										"error in plc.ts 23 " +
											ipAddress +
											": " +
											error +
											": " +
											s7client.ErrorText(err)
									);

									return;
								}
							}
						);
						break;
				}
			});
		} catch (error) {
			reject("error in plc.ts 24 " + ipAddress + ": " + error);

			return;
		}
	});
}
//convert byte array to hex string
function bytesToHexString(arr: Buffer) {
	let hex = "";
	for (let i = 0; i < arr.length; i++) {
		hex += (arr[i] >>> 4).toString(16);
		hex += (arr[i] & 0xf).toString(16);
	}
	return hex;
}

//read from plc x amount of markers
//return a array of bytes
async function readFromS7Markers(
	ipAddress: string,
	rack: number,
	slot: number,
	startMarker: number,
	length: number
) {
	return new Promise<Buffer>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					reject(
						"error in plc.ts 25 " + ipAddress + ": " + s7client.ErrorText(err)
					);

					return;
				}

				// Read the data from the PLC
				s7client.ReadArea(
					snap7Types.Area.S7AreaMK,
					0,
					startMarker,
					length,
					snap7Types.WordLen.S7WLByte,
					function (err, buffer) {
						if (err) {
							reject(
								"error in plc.ts 26 " +
									ipAddress +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}

						try {
							// Disconnect from the PLC
							s7client.Disconnect();

							// Return the buffer
							resolve(buffer);
						} catch (error) {
							reject(error);

							return;
						}
					}
				);
			});
		} catch (error) {
			reject("error in plc.ts 27 " + ipAddress + ": " + error);

			return;
		}
	});
}

//take a buffer and convert it to a bit from a byte
function bufferToBit(buffer: Buffer, byteNumber: number, bit: number) {
	return new Promise<boolean>((resolve, reject) => {
		try {
			//get the bit value from the byte
			let bitValue = buffer.readUInt8(byteNumber) & (1 << bit);
			bitValue = bitValue >> bit;

			resolve(bitValue == 1);
		} catch (error) {
			reject("error in plc.ts 28" + error);

			return;
		}
	});
}

//take a buffer and convert it to a bit from a byte
function bufferToBit2(buffer: Buffer, byteNumberAndBit: string) {
	return new Promise<boolean>((resolve, reject) => {
		try {
			//split the marker and bit by (.)
			const byteNumber = parseInt(byteNumberAndBit.toString().split(".")[0]);
			const bit = parseInt(byteNumberAndBit.toString().split(".")[1]);

			//get the bit value from the byte
			let bitValue = buffer.readUInt8(byteNumber) & (1 << bit);
			bitValue = bitValue >> bit;

			resolve(bitValue == 1);
		} catch (error) {
			reject("error in plc.ts 29" + error);

			return;
		}
	});
}

//read in a db to a buffer
async function readFromS7DBToBuffer(
	ipAddress: string,
	rack: number,
	slot: number,
	dbNumber: number,
	offset: number,
	length: number
) {
	return new Promise<Buffer>((resolve, reject) => {
		try {
			// Create a new client and connect to the PLC
			const s7client = new snap7.S7Client();
			s7client.ConnectTo(ipAddress, rack, slot, function (err) {
				//if error fall to catch block in function
				if (err) {
					reject(
						"error in plc.ts 30 " + ipAddress + ": " + s7client.ErrorText(err)
					);
					return;
				}

				// Read the data from the PLC
				s7client.ReadArea(
					snap7Types.Area.S7AreaDB,
					dbNumber,
					offset,
					length,
					snap7Types.WordLen.S7WLByte,
					function (err, buffer) {
						if (err) {
							reject(
								"error in plc.ts 31 " +
									ipAddress +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}

						try {
							// Disconnect from the PLC
							s7client.Disconnect();

							// Return the buffer
							resolve(buffer);
						} catch (error) {
							reject(
								"error in plc.ts 32 " +
									ipAddress +
									": " +
									error +
									": " +
									s7client.ErrorText(err)
							);

							return;
						}
					}
				);
			});
		} catch (error) {
			reject("error in plc.ts 33 " + ipAddress + ": " + error);
			return;
		}
	});
}

//export the function
export default {
	readFromS7DBToInt,
	readFromMakerByte,
	readFromMarkerBit,
	readFromMarkerBitNotSplit,
	readFromS7DBToInt2,
	readFromS7DBToBit,
	readFromS7Markers,
	readFromS7DBToBuffer,
	bufferToBit,
	bufferToBit2,
	readFromS7DbRAW,
	DataType,
};
