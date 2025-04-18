"use server";

import UserService from "@/server/services/userService";

/**
 * Get all users for admin panel
 */
export const getAllUsers = async ({ perPage = 10, page = 1, sortColumn = "id", sortOrder = "desc" }: PaginatedProps) => {
  return UserService.getAllUsersForAdmin({ perPage, page, sortColumn, sortOrder });
};

/**
 * Block a user
 */
export const blockUser = async (userId: number) => {
  try {
    await UserService.updateUserStatus(userId, false);
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, message: "Failed to block user" };
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (userId: number) => {
  try {
    await UserService.updateUserStatus(userId, true);
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return { success: false, message: "Failed to unblock user" };
  }
};

/**
 * Delete a user permanently
 */
export const deleteUser = async (userId: number) => {
  try {
    await UserService.deleteUser(userId);
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}; 