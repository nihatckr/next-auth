"use server"
import { currentRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";
import { error } from "console";

export const adminAction = async () => {
 const role = await currentRole();

 if (role === UserRole.ADMIN) {
   return {success:"Allowed Server Action!"};
 }
 return {error:"Forbidden Server Action!"}
}
