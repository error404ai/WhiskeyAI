"use server";

import { AdminDashboardService } from "@/server/services/admin/AdminDashboardService";
import AuthService from "@/server/services/auth/authService";

// Utility function to check if user is admin
async function checkAdminAccess() {
  const authUser = await AuthService.getAuthUser();
  if (!authUser || !authUser.isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return authUser;
}

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = async () => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminDashboardService.getDashboardStats();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch dashboard statistics",
      success: false
    };
  }
};

/**
 * Get recent user registrations
 */
export const getRecentUsers = async (limit = 5) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminDashboardService.getRecentUsers(limit);
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch recent users",
      success: false,
      data: []
    };
  }
};

/**
 * Get recent agent creations
 */
export const getRecentAgents = async (limit = 5) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminDashboardService.getRecentAgents(limit);
  } catch (error) {
    console.error("Error fetching recent agents:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch recent agents",
      success: false,
      data: []
    };
  }
};

/**
 * Get recent trigger logs
 */
export const getRecentTriggerLogs = async (limit = 5) => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminDashboardService.getRecentTriggerLogs(limit);
  } catch (error) {
    console.error("Error fetching recent trigger logs:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch recent trigger logs",
      success: false,
      data: []
    };
  }
};

/**
 * Get user registrations over time
 */
export const getUserRegistrationsOverTime = async (period: 'week' | 'month' | 'year' = 'week') => {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminDashboardService.getUserRegistrationsOverTime(period);
  } catch (error) {
    console.error("Error fetching user registrations over time:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch user registrations data",
      success: false,
      data: []
    };
  }
}; 