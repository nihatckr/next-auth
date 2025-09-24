"use client"
import { UserRole } from '@/lib/generated/prisma';
import { useCurrentRole } from '@/hooks/use-current-role';
import { FormError } from '@/components/form-error';


interface RoleGateProps {
  children?: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate: React.FC<RoleGateProps> = ({ children, allowedRole }) => {
  const role = useCurrentRole()
  if (role !== allowedRole) {
    return <FormError message='Access Denied' />;
  }

  return (
    <>{children}</>
  )
}
