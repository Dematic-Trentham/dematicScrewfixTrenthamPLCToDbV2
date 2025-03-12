import logger from "./logging";

//try catch function to catch any errors and log them to the console
function Void(fn: () => void, name?: string) {
	try {
		fn();
	} catch (err) {
		if (name != undefined) {
			logger.error("Error in " + name);
		}
		logger.error(err);
	}
}
//try catch function to catch any errors and log them to the console
async function Promise(fn: () => Promise<void>, name?: string) {
	try {
		await fn();
	} catch (err) {
		if (name != undefined) {
			logger.error("Error in " + name);
		}
		logger.error(err);
	}
}
//try catch function to catch any errors and log them to the console
function WithParam(fn: (param: any) => void, param: any, name?: string) {
	try {
		fn(param);
	} catch (err) {
		if (name != undefined) {
			logger.error("Error in " + name);
		}
		logger.error(err);
	}
}
//try catch function to catch any errors and log them to the console

async function PromiseWithParam(
	fn: (param: any) => Promise<any>,
	param: any,
	name?: string
) {
	try {
		await fn(param);
	} catch (err) {
		if (name != undefined) {
			logger.error("Error in " + name);
		}

		logger.error(err);
	}
}

export { Void, WithParam, Promise, PromiseWithParam };

export function tryCatchSimple(arg0: Promise<void>) {
	throw new Error("Function not implemented." + arg0);
}
