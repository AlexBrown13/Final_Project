import { Navigate } from "react-router-dom";
import { AUTH_TOKEN_KEY } from "../config/storageKeys.js";

/**
 * Redirects authenticated users away from login/register.
 */
export default function GuestRoute({ children }) {
  let token = "";
  try {
    token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    token = "";
  }

  if (token.length > 0) {
    return <Navigate to="/" replace />;
  }
  return children;
}
