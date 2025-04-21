import { db } from "@/server/db/db";
import { Function, functionsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export class FunctionService {
  static async getFunctions(type: "agent" | "trigger"): Promise<Function[]> {
    return await db.query.functionsTable.findMany({
      where: eq(functionsTable.type, type),
    });
  }
}
