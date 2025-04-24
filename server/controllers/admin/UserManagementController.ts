"use server";

import AuthService from "@/server/services/auth/authService";
import UserService from "@/server/services/userService";
import { maxAgentsSchema } from "@/server/zodSchema/maxAgentsSchema";
import { z } from "zod";

// Utility function to check if user is admin
async function checkAdminAccess() {
  const authUser = await AuthService.getAuthUser();
  if (!authUser || !authUser.isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return authUser;
}

export const getAllUsers = async ({ perPage = 10, page = 1, sortColumn = "id", sortOrder = "desc", search = "" }: PaginatedProps) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return UserService.getAllUsersForAdmin({ perPage, page, sortColumn, sortOrder, search });
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch users",
      data: [],
      pagination: { total: 0, lastPage: 0, perPage, currentPage: page }
    };
  }
};

export const blockUser = async (userId: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    await UserService.updateUserStatus(userId, false);
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to block user" };
  }
};

export const unblockUser = async (userId: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    await UserService.updateUserStatus(userId, true);
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to unblock user" };
  }
};

export const enableUnlimitedAccess = async (userId: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    await UserService.toggleUnlimitedAccess(userId, true);
    return { success: true, message: "Unlimited access enabled successfully" };
  } catch (error) {
    console.error("Error enabling unlimited access:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to enable unlimited access" };
  }
};

export const disableUnlimitedAccess = async (userId: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    await UserService.toggleUnlimitedAccess(userId, false);
    return { success: true, message: "Unlimited access disabled successfully" };
  } catch (error) {
    console.error("Error disabling unlimited access:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to disable unlimited access" };
  }
};

export const deleteUser = async (userId: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    await UserService.deleteUser(userId);
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete user" };
  }
};

export const updateUserMaxAgents = async (userId: number, maxAgents: number) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    // Validate max agents value using schema
    try {
      maxAgentsSchema.parse({ value: maxAgents });
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        return { success: false, message: zodError.errors[0].message };
      }
      throw zodError;
    }
    
    const result = await UserService.updateUserMaxAgents(userId, maxAgents);
    if (result) {
      return { success: true, message: "User's max agents limit updated successfully" };
    } else {
      return { success: false, message: "Failed to update user's max agents limit" };
    }
  } catch (error) {
    console.error("Error updating user's max agents:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to update user's max agents limit" };
  }
};
