import { UserType } from "@/db/schema/users";
import { UploadService } from "../services/uploadService";

export type UserResourceType = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  date_of_birth: string | null;
  phone: string | null;
  street_address: string | null;
  country: string | null;
};

class UserResource {
  private user: UserType;
  private uploadService: UploadService;
  constructor(user: UserType) {
    this.user = user;
    this.uploadService = new UploadService();
  }

  private getAvatarUrl() {
    if (this.user.avatar) {
      try {
        new URL(this.user.avatar);
        return this.user.avatar;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: unknown) {
        return this.uploadService.getUrl(this.user.avatar, "public");
      }
    }
    return this.uploadService.getUrl("/assets/images/default-profile-photo.jpg", "public");
  }
  toJSON(): UserResourceType {
    return {
      id: this.user.id,
      name: this.user.name,
      email: this.user.email,
      avatar: this.getAvatarUrl(),
      date_of_birth: this.user.date_of_birth,
      phone: this.user.phone,
      street_address: this.user.street_address,
      country: this.user.country,
    };
  }
}

export default UserResource;
