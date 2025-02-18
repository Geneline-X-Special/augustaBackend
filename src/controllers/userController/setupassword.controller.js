import userModel from "../../models/User.js";
import bcrypt from "bcrypt";

export const setup_password = async (req, res) => {
  const { userId } = req.user;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await passwordModel
    .create({
      userId,
      password: hashedPassword,
    })
    .then(async (response) => {
      await userModel
        .findOneAndUpdate(
          { _id: userId },
          { passwordRef: response._id },
          { new: true }
        )
        .then(() => {
          return res.status(201).json({
            message: "password successfully created",
            statusCode: 201,
          });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: err.message, statusCode: 500 });
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
}