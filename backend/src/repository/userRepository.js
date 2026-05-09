import { User } from "../model/User.js";

function deepMerge(oldObj = {}, newObj = {}) {
  for (const key in newObj) {
    if (
      oldObj[key] &&
      typeof oldObj[key] === "object" &&
      !Array.isArray(oldObj[key]) &&
      typeof newObj[key] === "object" &&
      !Array.isArray(newObj[key])
    ) {
      oldObj[key] = deepMerge(oldObj[key], newObj[key]);
    } else {
      oldObj[key] = newObj[key];
    }
  }
  return oldObj;
}

export const findUserById = async (id, options = {}) => {
  const user = await User.findByPk(id, options);
  if (!user) throw new Error("User not found");
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

export const createUser = async ({ name, email, hashedPassword, profile }) => {
  const user = await User.create({ name, email, hashedPassword, profile });
  return user;
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ["id", "profile"] });
  return user?.profile || {};
};

export const updateUserProfile = async (userId, newData) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const profile = user.profile || {};
  user.profile = deepMerge(profile, newData);

  await user.save();
  return user.profile;
};
