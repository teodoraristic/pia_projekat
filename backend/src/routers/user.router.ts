import express from "express";
import { UserController } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.route("/")
  .get((req, res) => new UserController().getAllUsers(req, res));
  
userRouter.route("/login")
  .post((req, res) => new UserController().login(req, res));

userRouter.route("/register")
  .post((req, res) => new UserController().register(req, res));

userRouter.route("/change-password")
  .put((req, res) => new UserController().changePassword(req, res));

userRouter.route("/update-profile")
  .put((req, res) => new UserController().updateProfile(req, res));

userRouter.route("/pending")
  .get((req, res) => new UserController().getPendingUsers(req, res));

userRouter.route('/:id/registration-status').put(
  (req, res) => new UserController().updateRegistrationStatus(req, res)
);

userRouter.route('/:id/deactivate').put(
  (req, res) => new UserController().deactivateUser(req, res)
);

userRouter.route('/:id/activate')
  .put((req, res) => new UserController().activateUser(req, res));

userRouter.route("/:id")
  .get((req, res) => new UserController().getUserById(req, res));


export default userRouter;