import db from "../db/db.js";

export async function getParameterFromDB(
	parameter: string,
	description?: string,
	defaultValue?: string
): Promise<string> {
	const result = await db.dashboardSystemParameters.findFirst({
		where: {
			parameter: parameter,
		},
	});

	//should we update the description of the parameter in the database if it is different from the one provided?
	if (result && description && result.description !== description) {
		await db.dashboardSystemParameters.update({
			where: {
				ID: result.ID,
			},
			data: {
				description: description,
			},
		});
	}

	//if no result
	if (!result) {
		//if we have a default value, return it,and also insert it into the database for future reference
		if (defaultValue !== undefined) {
			await db.dashboardSystemParameters.create({
				data: {
					parameter: parameter,
					value: defaultValue,
					description: description || "No description provided",
				},
			});
			return defaultValue;
		}

		if (defaultValue !== undefined) {
			return defaultValue;
		}
		throw new Error(`Parameter ${parameter} not found in the database`);
	}

	return result?.value;
}
