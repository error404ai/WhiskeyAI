import { db } from "@/db/db";
import { Function, functionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export class FunctionService {
  static async getFunctions(type: "agent" | "trigger"): Promise<Function[]> {
    return await db.query.functionsTable.findMany({
      where: eq(functionsTable.type, type),
    });
  }
}
