import { db } from "@/db/db";
import { rolesTable } from "../../schema/roles";
import { Seeder } from "../SeederInterface";

export class RoleSeeder implements Seeder {
  private roles = [{ name: "admin" }, { name: "user" }];
  async seed(): Promise<void> {
    await db.insert(rolesTable).values(this.roles);
  }
}
