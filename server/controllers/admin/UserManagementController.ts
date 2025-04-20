"use server";

import UserService from "@/server/services/userService";

export const getAllUsers = async ({ perPage = 10, page = 1, sortColumn = "id", sortOrder = "desc", search = "" }: PaginatedProps) => {
  return UserService.getAllUsersForAdmin({ perPage, page, sortColumn, sortOrder, search });
};

export const blockUser = async (userId: number) => {
  try {
    await UserService.updateUserStatus(userId, false);
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, message: "Failed to block user" };
  }
};

export const unblockUser = async (userId: number) => {
  try {
    await UserService.updateUserStatus(userId, true);
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return { success: false, message: "Failed to unblock user" };
  }
};

export const enableUnlimitedAccess = async (userId: number) => {
  try {
    await UserService.toggleUnlimitedAccess(userId, true);
    return { success: true, message: "Unlimited access enabled successfully" };
  } catch (error) {
    console.error("Error enabling unlimited access:", error);
    return { success: false, message: "Failed to enable unlimited access" };
  }
};

export const disableUnlimitedAccess = async (userId: number) => {
  try {
    await UserService.toggleUnlimitedAccess(userId, false);
    return { success: true, message: "Unlimited access disabled successfully" };
  } catch (error) {
    console.error("Error disabling unlimited access:", error);
    return { success: false, message: "Failed to disable unlimited access" };
  }
};

export const deleteUser = async (userId: number) => {
  try {
    await UserService.deleteUser(userId);
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
};
