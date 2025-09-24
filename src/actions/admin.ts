"use server"
import { currentRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";
import { error } from "console";

// Admin yetkilerini kontrol eden server action
export const adminAction = async () => {
 const role = await currentRole();

 if (role === UserRole.ADMIN) {
   return {success:"Server işlemi onaylandı!"};
 }
 return {error:"Yetkisiz server işlemi!"}
}
