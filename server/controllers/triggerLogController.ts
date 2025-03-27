"use server";

import { TriggerLogService } from "../services/agent/TriggerLogService";

export const getUserTriggerLogs = async ({ perPage = 10, page = 1, sortColumn = "id", sortOrder = "asc" }: PaginatedProps) => {
  return TriggerLogService.getUserTriggerLogs({ perPage, page, sortColumn, sortOrder });
};
