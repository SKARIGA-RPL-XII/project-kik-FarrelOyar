import { useAuthContext } from "app/contexts/auth/context";
import { Navigate } from 'react-router';

export default function RoleGuard({ children, allowedRoles = [] }) {
  // const user = JSON.parse(localStorage.getItem("profile"));
  const { user } = useAuthContext();

  // Jika belum login
  if (!user) return <Navigate to="/login" replace />;

  // Jika role tidak cocok
  if (allowedRoles.length && !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/unauthorized" replace />;
  } 

  // Akses diizinkan
  return children;
}
