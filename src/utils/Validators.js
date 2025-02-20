// Import Joi for data validation
import Joi from "joi";

const date = new Date(); // Get the current date

import { z } from 'zod';

///// ZOD VALIDATION ///

// Schema for one-to-one transfer
export const oneToOneTransferSchema = z.object({
  senderId: z.string().nonempty(),
  recipientId: z.string().nonempty(),
  amount: z.number().positive(),
});

// Schema for one-to-many distribution
export const distributionSchema = z.object({
  recipientId: z.string().nonempty(),
  amount: z.number().positive(),
});

export const oneToManyTransferSchema = z.object({
  senderId: z.string().nonempty(),
  distributions: z.array(distributionSchema).nonempty(),
});

// ============================== SCHEMAS ============================== //

/**
 * User Registration Schema
 * - Validates user details like name, email, date of birth, address, etc.
 */
const Registerschema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  dateOfBirth: Joi.date().less(date).required(), // Must be before today
  address: Joi.string().required(),
  nationalId: Joi.string().alphanum().length(10).required(), // 10-character alphanumeric ID
  phoneNumber: Joi.string().pattern(/^[0-9]{9}$/).required(), // 9-digit number
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/)
    .required(),
});

/**
 * User Login Schema
 * - Validates login credentials (email and password).
 */
const Signinschema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(30).required(),
});

/**
 * Card Schema
 * - Validates credit/debit card details.
 */
const cardSchema = Joi.object({
  cardNumber: Joi.string().length(16).required(),
  expiryDate: Joi.date().greater(date).required(), // Must be in the future
  cvv: Joi.string().length(3).required(),
  cardHolderName: Joi.string().min(2).max(30).required(),
  cardType: Joi.string().required(),
  zipCode: Joi.string(),
});

/**
 * Wallet Schema
 * - Validates wallet details such as currency and balance.
 */
const walletSchema = Joi.object({
  walletName: Joi.string().required(),
  currency: Joi.string().length(3).required(), // 3-letter currency code (e.g., USD)
  WalletBalance: Joi.number().min(0).required(),
  walletStatus: Joi.boolean().required(),
  expiryDate: Joi.date().greater("now").optional(), // Optional, but if provided, must be in the future
});

/**
 * Transaction Schema
 * - Validates transaction details like amount, type, status, etc.
 */
const transactionSchema = Joi.object({
  transactionAmount: Joi.number().positive().required().label("Transaction Amount").messages({
    "number.base": '"Transaction Amount" must be a number',
    "number.positive": '"Transaction Amount" must be a positive number',
    "any.required": '"Transaction Amount" is required',
  }),
  transactionType: Joi.string()
    .valid("deposit", "withdrawal", "transfer", "payment")
    .required()
    .label("Transaction Type")
    .messages({
      "any.only": '"Transaction Type" must be one of [deposit, withdrawal, transfer, payment]',
      "any.required": '"Transaction Type" is required',
    }),
  transactionDateTime: Joi.date().iso().required().label("Transaction Date and Time").messages({
    "date.base": '"Transaction Date and Time" must be a valid ISO date',
    "any.required": '"Transaction Date and Time" is required',
  }),
  transactionStatus: Joi.string()
    .valid("successful", "pending", "failed")
    .required()
    .label("Transaction Status")
    .messages({
      "any.only": '"Transaction Status" must be one of [successful, pending, failed]',
      "any.required": '"Transaction Status" is required',
    }),
  transactionDescription: Joi.string().max(255).optional().allow("").label("Transaction Description").messages({
    "string.max": '"Transaction Description" must be less than or equal to 255 characters',
  }),
  appFee: Joi.number().positive().required().label("App Fee").messages({
    "number.base": '"App Fee" must be a number',
    "number.positive": '"App Fee" must be a positive number',
    "any.required": '"App Fee" is required',
  }),
  totalAmount: Joi.number().positive().required().label("Total Amount").messages({
    "number.base": '"Total Amount" must be a number',
    "number.positive": '"Total Amount" must be a positive number',
    "any.required": '"Total Amount" is required',
  }),
  transactionFrom: Joi.string().required().label("Transaction From").messages({
    "string.base": '"Transaction From" must be a string',
    "any.required": '"Transaction From" is required',
  }),
  transactionTo: Joi.string().required().label("Transaction To").messages({
    "string.base": '"Transaction To" must be a string',
    "any.required": '"Transaction To" is required',
  }),
});

// ============================== VALIDATION FUNCTIONS ============================== //

/**
 * Validates user registration data.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} email - User's email.
 * @param {string} dateOfBirth - User's date of birth.
 * @param {string} address - User's address.
 * @param {string} nationalId - User's national ID.
 * @param {string} phoneNumber - User's phone number.
 * @param {string} password - User's password.
 * @returns {Object} Joi validation result.
 */
const registerValidator = (firstName, lastName, email, dateOfBirth, address, nationalId, phoneNumber, password) => {
  const data = { firstName, lastName, email, dateOfBirth, address, nationalId, phoneNumber, password };
  return Registerschema.validate(data);
};

/**
 * Middleware for validating user login requests.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const signinVlidator = (req, res, next) => {
  const { error } = Signinschema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};

/**
 * Validates card details.
 * @param {string} cardNumber - Card number (16 digits).
 * @param {Date} expiryDate - Expiration date.
 * @param {string} cvv - Card CVV (3 digits).
 * @param {string} cardHolderName - Cardholder's name.
 * @param {string} cardType - Type of card (e.g., Visa, MasterCard).
 * @param {string} zipCode - Optional zip code.
 * @returns {Object} Joi validation result.
 */
const cardValidator = (cardNumber, expiryDate, cvv, cardHolderName, cardType, zipCode) => {
  const data = { cardNumber, expiryDate, cvv, cardHolderName, cardType, zipCode };
  return cardSchema.validate(data);
};

/**
 * Validates wallet details.
 * @param {string} walletName - Name of the wallet.
 * @param {string} currency - Currency code (e.g., USD).
 * @param {number} WalletBalance - Wallet balance (non-negative).
 * @param {boolean} walletStatus - Wallet status (active/inactive).
 * @param {Date} expiryDate - Optional expiry date (must be in the future).
 * @returns {Object} Joi validation result.
 */
const walletValidator = (walletName, currency, WalletBalance, walletStatus, expiryDate) => {
  const data = { walletName, currency, WalletBalance, walletStatus, expiryDate };
  return walletSchema.validate(data);
};

/**
 * Validates transaction details.
 * @param {Object} transactionData - Transaction details.
 * @returns {Object} Joi validation result.
 */
const transactionValidator = (transactionAmount, transactionType, transactionDateTime, transactionStatus, transactionDescription, appFee, totalAmount, transactionFrom, transactionTo) => {
  const data = { transactionAmount, transactionType, transactionDateTime, transactionStatus, transactionDescription, appFee, totalAmount, transactionFrom, transactionTo };
  return transactionSchema.validate(data);
};

// Export all validators for use in controllers and routes
export default {
  registerValidator,
  signinVlidator,
  cardValidator,
  walletValidator,
  transactionValidator,
};