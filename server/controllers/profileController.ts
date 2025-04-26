"use server";

import UserService from "@/server/services/userService";
import { profileBasicInfoSchema } from "@/server/zodSchema/profileUpdateSchema";
import { UserResourceType } from "../resource/userResource";
import AuthService from "../services/auth/authService";

export const updateProfileBasicInfo = async (formData: FormData): Promise<boolean> => {
  const formDataObject = Object.fromEntries(formData.entries()) as Record<string, unknown>;
  const data = profileBasicInfoSchema.parse(formDataObject);
  if (!data) {
    return false;
  }

  return await UserService.updateProfileBasicInfo(data, formData);
};

export const getAuthUser = async (): Promise<UserResourceType | null> => {
  const authUser = await AuthService.getAuthUser();

  if (!authUser) {
    return null;
  }
  return authUser;
};

// export const updatePassword = async (data: unknown): Promise<boolean | string> => {
//   const parsedData = passwordUpdateSchema.parse(data);
//   const customerId = (await AuthService.getAuthUser())?.customer_id;

//   if (!customerId) return false;
//   return await UserService.updatePassword(customerId, parsedData);
// };

export const deleteUserAccount = async (userId: number): Promise<string> => {
  try {
    await UserService.deleteUser(userId);
    return "User account deleted successfully.";
  } catch (error) {
    console.error("Error deleting user account:", error);
    return "Failed to delete user account.";
  }
};
