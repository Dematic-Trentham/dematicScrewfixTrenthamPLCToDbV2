// import { PrismaClient } from "@prisma/client";

// const prismaClientSingleton = () => {
// 	return new PrismaClient({
// 		log: ["info"],
// 	});
// };

// declare global {
// 	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
// }

// const db = globalThis.prisma ?? prismaClientSingleton();

// export default db;

// if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

/* import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	connectionLimit: 5,
});
const db = new PrismaClient({ adapter });

export default db */ import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	db?: PrismaClient;
};

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	connectionLimit: parseInt(process.env.CONNECTION_LIMIT || "1", 10),
	acquireTimeout: parseInt(process.env.ACQUIRE_TIMEOUT || "20000", 10), // 20 seconds
});

export const db = globalForPrisma.db ?? new PrismaClient({ adapter });

globalForPrisma.db = db;

export default db;
