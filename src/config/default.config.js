import dotenv from 'dotenv';
dotenv.config();
const {
  APP_PORT,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  DB_NAME,
  JWT_SECRET,
  MONGODB_URI,
} = process.env;
export const appPort = APP_PORT;
export const dbUrl = `mongodb://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin&authMechanism=DEFAULT`;

export const jwtSecret = JWT_SECRET;
export const dbProductionUrl = MONGODB_URI;
