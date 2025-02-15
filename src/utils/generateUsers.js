import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import userModel from '../models/User.js';
import { configDotenv } from 'dotenv';
configDotenv()
// Connect to your MongoDB database
mongoose.connect(process.env.MONGO_DB_URL);

// Function to create a random user
function createRandomUser() {
  return {
    phoneNumber: faker.phone.number(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.birthdate(),
    address: faker.location.streetAddress(),
    nationalId: faker.string.uuid(),
    otp: faker.string.numeric(6),
    password: faker.internet.password(),
    phoneVerified: faker.datatype.boolean(),
  };
}

// Generate and insert dummy users into the database
async function insertDummyUsers() {
  const dummyUsers = Array.from({ length: 10 }, createRandomUser);
  try {
    await userModel.insertMany(dummyUsers);
    console.log('Dummy users inserted successfully.');
  } catch (error) {
    console.error('Error inserting dummy users:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertDummyUsers();
