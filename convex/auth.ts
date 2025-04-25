import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

type Role = "student" | "teacher" | "admin";
type Gender = "male" | "female"; // ตาม schema ที่กำหนดไว้

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      fname: params.fname as string,
      lname: params.lname as string,
      role: (params.role as Role) ?? "student",
      identificationCode: params.identificationCode as string,
      email: params.email as string,
      gender: (params.gender as Gender) ?? "male", // หรือ "female" เป็น default
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
