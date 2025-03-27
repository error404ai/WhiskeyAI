import { db } from "@/db/db";
import { usersTable } from "@/db/schema/usersTable";
import UserService from "@/server/services/userService";
import { Seeder } from "../SeederInterface";

export class UserSeeder implements Seeder {
  async seed(): Promise<void> {
    await db.insert(usersTable).values({
      customer_id: UserService.generateCustomerId(),
      publicKey: "publicKey",
      roleId: 1,
    });
  }
}
