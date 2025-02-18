import mongoose from "mongoose";

/**
 * @desc   Mongoose schema for storing user passwords securely.
 * @schema passwordSchema
 * @fields 
 *    - userId: References the user this password belongs to.
 *    - password: Stores the hashed password (Required).
 *    - timestamps: Automatically adds createdAt and updatedAt fields.
 */

const passwordSchema = mongoose.Schema(
  {
    /**
     * @field userId
     * @desc  References the user associated with this password entry.
     * @type  ObjectId (Mongoose reference to 'users' collection).
     * @default  null (Ensures no orphaned password documents).
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Reference to the "users" collection
      default: null,
    },

    /**
     * @field password
     * @desc  Stores the hashed user password.
     * @type  String (Required field).
     */
    password: { 
      type: String, 
      required: true 
    },
  },
  {
    /**
     * @option timestamps
     * @desc  Automatically tracks creation and last update times.
     */
    timestamps: true,
  }
);

// Create and export the Mongoose model for passwords
const passwordModel = mongoose.model("Password", passwordSchema);
export default passwordModel;
