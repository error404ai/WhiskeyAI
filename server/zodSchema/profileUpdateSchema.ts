import { z } from "zod";

export const profileBasicInfoSchema = z.object({
  customer_id: z.string().nonempty({ message: "Customer ID is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
  avatar: z.any().optional(),
  email: z.string().email("Email address is invalid").nonempty({ message: "Email is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  country: z.string().optional(),
  street_address: z.string().optional(),
});
