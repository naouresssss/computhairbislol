import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { ProfilCapillaire } from "../entities/Profilcapillaire";
import { DicoTerm } from "../entities/Dicoterm";//ajoute l'entité des termes du dictionnaire

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === "development",
  //logging: process.env.NODE_ENV === "development",
  entities: [User,ProfilCapillaire, DicoTerm],
  migrations: [],
  subscribers: [],
});
export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
}
