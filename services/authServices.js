import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../helpers/sendEmail.js";

import User from "../db/models/User.js";

import HttpError from "../helpers/HttpError.js";

import { generateToken } from "../helpers/jwt.js";

export const findUser = (query) =>
  User.findOne({
    where: query,
  });

export const registerUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  try {
    await sendEmail(email, verificationToken);
  } catch (error) {
    throw HttpError(500, "Register verify email error");
  }

  const newUser = User.create({
    ...data,
    password: hashPassword,
    verificationToken,
  });

  return newUser;
};

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const payload = {
    email,
  };

  const token = generateToken(payload);

  await user.update({ token });

  return { token };
};

export const verifyEmail = async (verificationToken) => {
  const user = await findUser({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  return user.update(
    { verificationToken: null, verify: true },
    {
      returning: true,
    }
  );
};

export const resendVerify = async (email) => {
  const user = await findUser({ email });
  if (!user) return null;
  if (user.verify) throw HttpError(404, "Verification has already been passed");
  try {
    await sendEmail(email, user.verificationToken);
  } catch (error) {
    throw HttpError(500, "Register verify email error");
  }
  return true;
};

export const logoutUser = async (id) => {
  const user = await findUser({ id });
  if (!user || !user.token) {
    throw HttpError(404, "User not found");
  }

  await user.update({ token: null });
};

export const setAvatar = async (id, avatarURL) => {
  const user = await findUser({ id });
  await user.update({ avatarURL });
};
