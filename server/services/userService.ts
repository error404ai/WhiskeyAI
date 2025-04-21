import { db } from "@/server/db/db";
import { rolesTable, usersTable } from "@/server/db/schema";
import { profileBasicInfoSchema } from "@/server/zodSchema/profileUpdateSchema";
import { DrizzlePaginator } from "@skmirajbn/drizzle-paginator";
import { eq, like, or } from "drizzle-orm";
import { z, ZodError } from "zod";
import UserResource, { UserResourceType } from "../resource/userResource";
import { UploadService } from "./uploadService";

class UserService {
  static async getUsers() {
    return await db.select().from(usersTable);
  }

  static async findUserByPublicKey(publicKey: string): Promise<UserResourceType | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.publicKey, publicKey),
    });
    return user ? new UserResource(user).toJSON() : null;
  }

  static async findUserByCustomerId(customerId: string): Promise<UserResourceType | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.customer_id, customerId),
    });
    return user ? new UserResource(user).toJSON() : null;
  }

  static async createUserByPublicKey(publicKey: string): Promise<UserResourceType | null> {
    await db.insert(usersTable).values({
      customer_id: this.generateCustomerId(),
      roleId: 2,
      publicKey,
      email: "",
    });

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.publicKey, publicKey),
    });
    return user ? new UserResource(user).toJSON() : null;
  }

  static async updateProfileBasicInfo(data: z.infer<typeof profileBasicInfoSchema>, formData: FormData): Promise<boolean> {
    const uploadService = new UploadService();
    const avatar = formData.get("avatar") as File | null;
    await db.transaction(async (tx) => {
      const user = await tx.query.usersTable.findFirst({
        where: eq(usersTable.customer_id, data.customer_id),
      });

      if (!user) {
        throw new ZodError([{ code: "custom", message: "User not found", path: ["customer_id"] }]).toString();
      }

      if (user?.email !== data.email) {
        const existingUser = await UserService.findUserByCustomerId(data.customer_id);
        if (existingUser && existingUser.customer_id !== user?.customer_id) {
          throw new ZodError([{ code: "custom", message: "Email already exists", path: ["email"] }]).toString();
        }
      }

      if (avatar) {
        if (user?.avatar && (await uploadService.fileExists(user.avatar))) {
          console.log("exists");
          await uploadService.deleteFile(user.avatar);
        }
        const uploadedImage = await uploadService.uploadImage(avatar, {
          width: 400,
          height: 400,
          quality: 80,
          directory: "uploads/images/avatars",
        });
        await tx
          .update(usersTable)
          .set({
            ...data,
            avatar: uploadedImage ? uploadedImage.path : null,
          })
          .where(eq(usersTable.customer_id, data.customer_id));
      } else {
        await tx
          .update(usersTable)
          .set({
            ...data,
          })
          .where(eq(usersTable.customer_id, data.customer_id));
      }
    });

    return true;
  }

  static async getAllUsersForAdmin({ perPage = 10, page = 1, search = "" }: PaginatedProps) {
    const query = db.select().from(usersTable).leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id)).orderBy(usersTable.id);

    if (search) {
      query.where(or(eq(usersTable.customer_id, search), like(usersTable.publicKey, `%${search}%`), like(usersTable.email, `%${search}%`)));
    }

    const paginator = new DrizzlePaginator(db, query).page(page);

    return paginator.paginate(perPage);
  }

  static async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    try {
      await db
        .update(usersTable)
        .set({
          is_active: isActive,
        })
        .where(eq(usersTable.id, userId));
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Failed to update user status.");
    }
  }

  static async toggleUnlimitedAccess(userId: number, hasUnlimitedAccess: boolean): Promise<void> {
    try {
      await db
        .update(usersTable)
        .set({
          has_unlimited_access: hasUnlimitedAccess,
        })
        .where(eq(usersTable.id, userId));
    } catch (error) {
      console.error("Error updating user unlimited access:", error);
      throw new Error("Failed to update user unlimited access status.");
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user.");
    }
  }

  static generateCustomerId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);

    return `CUS${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }
}

export default UserService;
