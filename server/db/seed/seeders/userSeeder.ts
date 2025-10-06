import { db } from "@/server/db/db";
import { adminCredentialsTable, usersTable } from "@/server/db/schema";
import UserService from "@/server/services/userService";
import bcrypt from "bcryptjs";
import { Seeder } from "../SeederInterface";

export class UserSeeder implements Seeder {
  async seed(): Promise<void> {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const user = await db
      .insert(usersTable)
      .values({
        customer_id: UserService.generateCustomerId(),
        publicKey: "admin",
        roleId: 1,
      })
      .returning();

    if (user.length > 0) {
      await db.insert(adminCredentialsTable).values({
        userId: user[0].id,
        username: "admin",
        password: hashedPassword,
      });
    }
  }
}
