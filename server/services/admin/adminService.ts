import { db } from "@/server/db/db";
import { adminCredentialsTable, usersTable } from "@/server/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import UserResource, { UserResourceType } from "../../resource/userResource";
import UserService from "../userService";

class AdminService {
  static async findAdminByUsername(username: string) {
    const adminCredential = await db.query.adminCredentialsTable.findFirst({
      where: eq(adminCredentialsTable.username, username),
      with: {
        user: true,
      },
    });

    return adminCredential;
  }

  static async validateAdminCredentials(username: string, password: string): Promise<UserResourceType | null> {
    const adminCredential = await this.findAdminByUsername(username);
    console.log("username is", username);
    console.log("adminCredential is", adminCredential);

    if (!adminCredential) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, adminCredential.password);
    console.log("isPasswordValid is", isPasswordValid);

    if (!isPasswordValid) {
      return null;
    }

    return new UserResource(adminCredential.user).toJSON();
  }

  static async createAdmin(username: string, password: string, name: string, email: string): Promise<boolean> {
    try {
      // Check if username already exists
      const existingAdmin = await this.findAdminByUsername(username);
      if (existingAdmin) {
        throw new Error("Username already exists");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      return await db.transaction(async (tx) => {
        // Create user with admin role (roleId 1 for admin)
        const user = await tx
          .insert(usersTable)
          .values({
            customer_id: UserService.generateCustomerId(),
            publicKey: `admin_${username}`,
            name: name,
            email: email,
            roleId: 1,
          })
          .returning();

        if (!user || user.length === 0) {
          throw new Error("Failed to create admin user");
        }

        // Create admin credentials
        await tx.insert(adminCredentialsTable).values({
          userId: user[0].id,
          username: username,
          password: hashedPassword,
        });

        return true;
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  static async isAdmin(userId: number): Promise<boolean> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return user?.roleId === 1; // Assuming roleId 1 is for admin
  }
}

export default AdminService;
