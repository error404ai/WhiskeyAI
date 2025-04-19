"use server";

import { AdminDashboardService } from "@/server/services/admin/AdminDashboardService";

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = async () => {
  try {
    return await AdminDashboardService.getDashboardStats();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { 
      error: "Failed to fetch dashboard statistics",
      success: false
    };
  }
};

/**
 * Get recent user registrations
 */
export const getRecentUsers = async (limit = 5) => {
  try {
    return await AdminDashboardService.getRecentUsers(limit);
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return { 
      error: "Failed to fetch recent users",
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
    return await AdminDashboardService.getRecentAgents(limit);
  } catch (error) {
    console.error("Error fetching recent agents:", error);
    return { 
      error: "Failed to fetch recent agents",
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
    return await AdminDashboardService.getRecentTriggerLogs(limit);
  } catch (error) {
    console.error("Error fetching recent trigger logs:", error);
    return { 
      error: "Failed to fetch recent trigger logs",
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
    return await AdminDashboardService.getUserRegistrationsOverTime(period);
  } catch (error) {
    console.error("Error fetching user registrations over time:", error);
    return { 
      error: "Failed to fetch user registrations data",
      success: false,
      data: []
    };
  }
}; 