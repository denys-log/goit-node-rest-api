import express from "express";

import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

import authControllers from "../controllers/authControllers.js";

import validateBody from "../decorators/validateBody.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";
import {
  authRegisterSchema,
  authLoginSchema,
  authVerifyEmailSchema,
} from "../schemas/authSchemas.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(authRegisterSchema),
  authControllers.registerController
);

authRouter.post(
  "/login",
  validateBody(authLoginSchema),
  authControllers.loginController
);

authRouter.post("/logout", authenticate, authControllers.logoutController);

authRouter.get("/current", authenticate, authControllers.getCurrentController);

authRouter.patch(
  "/avatars",
  upload.single("photo"),
  authenticate,
  authControllers.changeAvatarController
);

authRouter.post(
  "/verify",
  isEmptyBody,
  validateBody(authVerifyEmailSchema),
  authControllers.resendVerifyController
);
authRouter.get(
  "/verify/:verificationToken",
  authControllers.verifyEmailController
);

export default authRouter;
