import logger from "./misc/logging.js";

const debuging = {
	timming: true,
};

const runningTasks: Set<string> = new Set();

async function runTask(
	name: string,
	time: number,
	task: () => Promise<void>
): Promise<void> {
	if (runningTasks.has(name)) {
		logger.warn(`Task ${name} is already running.`);
		return;
	}

	runningTasks.add(name);
	const start = Date.now();
	try {
		await task();
	} catch (error) {
		logger.error(`Error in task ${name}:`, error);
	} finally {
		const end = Date.now();
		const duration = end - start;
		if (debuging.timming) {
			//logger.info(
			//	`Task ${name} completed in ${duration}ms. Time taken: ${time}ms` +
			//` (${((duration / time) * 100).toFixed(2)}% of expected time)`;
			//);
		}
		runningTasks.delete(name);
	}
}

function createTimedTasks(
	taskDefinitions: { name: string; task: () => Promise<any> }[]
) {
	return taskDefinitions.map(({ name, task }) => ({
		name,
		task: (async () => {
			const start = Date.now();
			await task();
			const end = Date.now();

			if (debuging.timming) {
				//logger.info(`Task ${name} took ${end - start}ms`);
			}
		})(),
	}));
}

export default { debuging, runTask, createTimedTasks };
export { runTask, createTimedTasks };
