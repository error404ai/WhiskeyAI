import { db } from "@/db/db";
import { usersTable } from "@/db/schema/users";
import { Seeder } from "../SeederInterface";

export class UserSeeder implements Seeder {
  async seed(): Promise<void> {
    await db.insert(usersTable).values({
      publicKey: "publicKey",
      roleId: 1,
    });
  }
}
