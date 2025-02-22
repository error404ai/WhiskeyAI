import { db } from "@/db/db";
import { usersTable } from "@/db/schema/users";
import { makeHash } from "@/utils/utils";
import { Seeder } from "../SeederInterface";

export class UserSeeder implements Seeder {
  async seed(): Promise<void> {
    const hashedPassword = await makeHash("12345678");
    await db.insert(usersTable).values({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      roleId: 1,
    });
  }
}
