import { UserType } from "@/db/schema/users";
import { UploadService } from "../services/uploadService";

export type UserResourceType = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  avatar: string;
  date_of_birth: string | null;
  phone: string | null;
  street_address: string | null;
  country: string | null;
  emailVerified: Date | null;
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
        return this.uploadService.getUrl(this.user.avatar);
      }
    }
    // return this.uploadService.getUrl("/assets/images/default-profile-photo.jpg", "public");
    return "https://i.pinimg.com/736x/37/8f/ce/378fce78771b5c43dc1e3c775350dfa7.jpg";
  }
  toJSON(): UserResourceType {
    return {
      id: String(this.user.id),
      customer_id: this.user.customer_id,
      name: this.user.name,
      email: this.user.email,
      avatar: this.getAvatarUrl(),
      date_of_birth: this.user.date_of_birth,
      phone: this.user.phone,
      street_address: this.user.street_address,
      country: this.user.country,
      emailVerified: this.user.emailVerified ? new Date(this.user.emailVerified) : null,
    };
  }
}

export default UserResource;
