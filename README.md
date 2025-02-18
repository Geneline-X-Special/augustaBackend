# Mobile Money Transaction Integration

This document provides an overview of the mobile money transaction integration using the Monime API. The implementation is located in the `mobileMoneyController.js` file within the `src/controllers/loadWallet/` directory.

## Overview

The `mobileMoneyController.js` file contains three primary functions:

1. **initiateTransaction**: Initiates a mobile money transaction by creating a session with the Monime API.
2. **handleReceipt**: Handles the callback for successful transactions, updating the user's wallet balance accordingly.
3. **handleCancel**: Handles the callback for canceled or failed transactions.

## Dependencies

The following packages are utilized in this implementation:

- `uuid`: For generating unique identifiers.
- `node-fetch`: For making HTTP requests.
- `dotenv`: For loading environment variables.
- `userModel`, `Transaction`, `Wallet`: Mongoose models representing the User, Transaction, and Wallet collections, respectively.

Ensure these packages are installed and properly configured in your project.

## Environment Variables

The implementation relies on several environment variables. Ensure the following variables are defined in your `.env` file:

- `MONIME_CHECKOUT_URL`: The Monime API endpoint for initiating transactions.
- `MONIME_SPACE_ID`: Your Monime space identifier.
- `MONIME_ACCESS_TOKEN`: The access token for authenticating with the Monime API.
- `OLTRA_PAY_REDIRECT_URL`: The base URL for your application's redirect endpoints.

## Function Details

### 1. initiateTransaction

This asynchronous function initiates a transaction by:

- Extracting `userId` and `amount` from the request body.
- Validating the presence of these parameters.
- Retrieving the user from the database using `userId`.
- Generating a unique `idempotencyKey` using `uuidv4()`.
- Making a POST request to the Monime API to create a transaction session.
- Extracting the `checkoutUrl` from the Monime API response.
- Returning the `checkoutUrl` in the response for the client to proceed with the payment.

**API Endpoint**: `/api/mobile-money/initiate`

**Method**: `POST`

**Request Body**:

```json
{
  "userId": "string", // Required: The unique identifier of the user.
  "amount": "number"  // Required: The amount to be transacted.
}
```

**Response**:

- `200 OK`: Returns a JSON object containing the `checkoutUrl` for the client to proceed with the payment.

  ```json
  {
    "url": "string" // The Monime checkout URL.
  }
  ```

- `400 Bad Request`: Missing required parameters.

  ```json
  {
    "error": "Missing required parameters: userId and amount"
  }
  ```

- `401 Unauthorized`: User not found.

  ```json
  {
    "error": "Unauthorized"
  }
  ```

- `500 Internal Server Error`: Failed to create Monime session.

  ```json
  {
    "error": "Failed to create Monime session"
  }
  ```

### 2. handleReceipt

This function processes successful transaction callbacks by:

- Extracting `amount` and `userId` from the query parameters.
- Validating the presence of these parameters.
- Retrieving the user from the database using `userId`.
- Finding or creating a wallet associated with the user.
- Updating the wallet balance by adding the deposited amount.
- Saving the updated wallet information.
- Recording the transaction details in the `Transaction` collection.

**API Endpoint**: `/api/mobile-money/receipt`

**Method**: `GET`

**Query Parameters**:

- `userId`: Required. The unique identifier of the user.
- `amount`: Required. The amount that was transacted.

**Response**:

- `200 OK`: Transaction successful. Wallet updated.

  ```
  Transaction successful. Wallet updated.
  ```

- `400 Bad Request`: Missing required parameters.

  ```
  Missing required parameters
  ```

- `404 Not Found`: User not found.

  ```
  User not found
  ```

- `500 Internal Server Error`: Error processing receipt callback.

  ```
  Internal server error
  ```

### 3. handleCancel

This function handles canceled or failed transactions by:

- Extracting `monimeSessionId`, `userId`, and `amount` from the query parameters.
- Logging the cancellation details for reference.

**API Endpoint**: `/api/mobile-money/cancel`

**Method**: `GET`

**Query Parameters**:

- `monimeSessionId`: Optional. The session ID of the Monime transaction.
- `userId`: Required. The unique identifier of the user.
- `amount`: Optional. The amount that was to be transacted.

**Response**:

- `200 OK`: Transaction canceled/failed. No funds loaded.

  ```
  Transaction canceled/failed. No funds loaded.
  ```

- `400 Bad Request`: Missing required parameter: userId.

  ```
  Missing required parameter: userId
  ```

- `500 Internal Server Error`: Error processing cancel callback.

  ```
  Internal server error
  ```

## Error Handling

Each function includes error handling to manage exceptions that may occur during execution. Errors are logged to the console, and appropriate HTTP status codes and messages are returned to the client.

## Usage

To integrate these functions into your application:

- Import the controller functions into your route definitions.
- Define routes that map to these functions. For example:

  ```javascript
  import express from 'express';
  import { initiateTransaction, handleReceipt, handleCancel } from './controllers/loadWallet/mobileMoneyController.js';

  const router = express.Router();

  router.post('/api/mobile-money/initiate', initiateTransaction);
  router.get('/api/mobile-money/receipt', handleReceipt);
  router.get('/api/mobile-money/cancel', handleCancel);

  export default router;
  ```

Ensure that your Express application uses this router and that the necessary middleware (such as `express.json()` for parsing JSON request bodies) is configured.

## Testing the Endpoints

You can use tools like Postman to test these endpoints:

1. **Initiate Transaction**:

   - **Method**: `POST`
   - **URL**: `http://your-domain.com/api/mobile-money/initiate`
   - **Body**: (JSON)

     ```json
     {
       "userId": "user-id-here",
       "amount": "amount-here"
     }
     ```

   - **Headers**:

     ```
     Content-Type: application/json
     ```

2. **Handle Receipt**:

   - **Method**: `GET`
   - **URL**: `http://your-domain.com/api/mobile-money/receipt?userId=user-id-here&amount=amount-here`

3. **Handle Cancel**:

   - **Method**: `GET`
   - **URL**: `http://your-domain.com/api/mobile-money/cancel?userId=user-id-here&monimeSessionId=session-id-here&amount=amount-here`


```markdown
# Mobile Money Transaction Integration

This document provides an overview of the mobile money transaction integration using the Monime API. The implementation is located in the `mobileMoneyController.js` file within the `src/controllers/loadWallet/` directory.

## Overview

The `mobileMoneyController.js` file contains four primary functions:

1. **initiateTransaction**: Initiates a mobile money transaction by creating a session with the Monime API.
2. **handleReceipt**: Handles the callback for successful transactions, updating the user's wallet balance accordingly.
3. **handleCancel**: Handles the callback for canceled or failed transactions.
4. **initiateTransfer**: Handles transferring funds between users within the system.
5. **distributeFunds**: Handles fund distribution among multiple users.

## Dependencies

The following packages are utilized in this implementation:

- `uuid`: For generating unique identifiers.
- `node-fetch`: For making HTTP requests.
- `dotenv`: For loading environment variables.
- `userModel`, `Transaction`, `Wallet`: Mongoose models representing the User, Transaction, and Wallet collections, respectively.

Ensure these packages are installed and properly configured in your project.

## Environment Variables

The implementation relies on several environment variables. Ensure the following variables are defined in your `.env` file:

- `MONIME_CHECKOUT_URL`: The Monime API endpoint for initiating transactions.
- `MONIME_SPACE_ID`: Your Monime space identifier.
- `MONIME_ACCESS_TOKEN`: The access token for authenticating with the Monime API.
- `OLTRA_PAY_REDIRECT_URL`: The base URL for your application's redirect endpoints.

## Function Details

### 1. initiateTransaction

This asynchronous function initiates a transaction by:

- Extracting `userId` and `amount` from the request body.
- Validating the presence of these parameters.
- Retrieving the user from the database using `userId`.
- Generating a unique `idempotencyKey` using `uuidv4()`.
- Making a POST request to the Monime API to create a transaction session.
- Extracting the `checkoutUrl` from the Monime API response.
- Returning the `checkoutUrl` in the response for the client to proceed with the payment.

**API Endpoint**: `/api/mobile-money/initiate`

**Method**: `POST`

**Request Body**:

```json
{
  "userId": "string", // Required: The unique identifier of the user.
  "amount": "number"  // Required: The amount to be transacted.
}
```

### 2. handleReceipt

This function processes successful transaction callbacks by:

- Extracting `amount` and `userId` from the query parameters.
- Validating the presence of these parameters.
- Retrieving the user from the database using `userId`.
- Finding or creating a wallet associated with the user.
- Updating the wallet balance by adding the deposited amount.
- Saving the updated wallet information.
- Recording the transaction details in the `Transaction` collection.

**API Endpoint**: `/api/mobile-money/receipt`

**Method**: `GET`

### 3. handleCancel

This function handles canceled or failed transactions by:

- Extracting `monimeSessionId`, `userId`, and `amount` from the query parameters.
- Logging the cancellation details for reference.

**API Endpoint**: `/api/mobile-money/cancel`

**Method**: `GET`

### 4. initiateTransfer

This function facilitates the transfer of funds from one user to another within the system by:

- Extracting `senderId`, `receiverId`, and `amount` from the request body.
- Validating the presence of these parameters.
- Checking if the sender has sufficient balance in their wallet.
- Deducting the amount from the sender’s wallet.
- Adding the amount to the receiver’s wallet.
- Recording the transaction in the `Transaction` collection.

**API Endpoint**: `/api/mobile-money/transfer`

**Method**: `POST`

### 5. distributeFunds

This function handles fund distribution among multiple users by:

- Extracting `distributions` from the request body, which contains an array of `{ userId, amount }` objects.
- Validating the presence of these parameters.
- Checking if the sender has sufficient balance in their wallet.
- Deducting the total amount from the sender’s wallet.
- Adding the respective amounts to the recipients’ wallets.
- Recording the transactions in the `Transaction` collection.

**API Endpoint**: `/api/mobile-money/distribute`

**Method**: `POST`

## Route Configuration

Routes for handling mobile money transactions and inter-wallet transfers are defined in `transferRouter.js`:

```javascript
import { Router } from "express";
import { distributeFunds, transferFunds } from "../../controllers/interWalletTransaction/interWalletTransaction.js";
const transferRouter = Router();

transferRouter.post("/transfer", transferFunds);
transferRouter.post("/distribute", distributeFunds);

export default transferRouter;
```

## Error Handling

Each function includes error handling to manage exceptions that may occur during execution. Errors are logged to the console, and appropriate HTTP status codes and messages are returned to the client.

## Usage

To integrate these functions into your application:

- Import the controller functions into your route definitions.
- Define routes that map to these functions. For example:

  ```javascript
  import express from 'express';
  import { initiateTransaction, handleReceipt, handleCancel, initiateTransfer, distributeFunds } from './controllers/loadWallet/mobileMoneyController.js';

  const router = express.Router();

  router.post('/api/mobile-money/initiate', initiateTransaction);
  router.get('/api/mobile-money/receipt', handleReceipt);
  router.get('/api/mobile-money/cancel', handleCancel);
  router.post('/api/mobile-money/transfer', initiateTransfer);
  router.post('/api/mobile-money/distribute', distributeFunds);

  export default router;
  ```

Ensure that your Express application uses this router and that the necessary middleware (such as `express.json()` for parsing JSON request bodies) is configured.
```

