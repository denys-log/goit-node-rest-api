import fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import * as authServices from "../services/authServices.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const avatarsDir = path.resolve("public", "avatars");

const registerController = async (req, res) => {
  const avatarURL = gravatar.url(req.body.email);
  const { email, subscription } = await authServices.registerUser({
    ...req.body,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email,
      subscription,
      avatarURL,
    },
  });
};

const loginController = async (req, res) => {
  const { token, user } = await authServices.loginUser(req.body);

  res.json({ token, user });
};

const logoutController = async (req, res) => {
  const { id } = req.user;
  await authServices.logoutUser(id);

  res.status(204).json({
    message: "Logout successfully",
  });
};

const getCurrentController = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const changeAvatar = async (req, res, next) => {
  let avatarURL = null;
  if (req.file) {
    const { id } = req.user;
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsDir, filename);
    await fs.rename(oldPath, newPath);
    avatarURL = path.join("avatars", filename);
    await authServices.setAvatar(id, avatarURL);
    return res.json({ avatarURL });
  }
};

export const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const result = await authServices.verifyEmail(verificationToken);
  if (!result) throw HttpError(404, "User not found");
  res.json({
    status: 200,
    message: "Verification successful",
  });
};

export const resendVerify = async (req, res) => {
  const { email } = req.body;
  const result = await authServices.resendVerify(email);
  if (!result) throw HttpError(404, "User not found");
  res.json({
    status: 200,
    message: "Verification email sent",
  });
};

export default {
  registerController: ctrlWrapper(registerController),
  loginController: ctrlWrapper(loginController),
  logoutController: ctrlWrapper(logoutController),
  getCurrentController: ctrlWrapper(getCurrentController),
  changeAvatarController: ctrlWrapper(changeAvatar),
  verifyEmailController: ctrlWrapper(verifyEmail),
  resendVerifyController: ctrlWrapper(resendVerify),
};
