import log4js from "log4js";
import dotenv from "dotenv";

dotenv.config();

const Logger = log4js.getLogger();
Logger.level = process.env.LOG_LEVEL;

export default Logger;
