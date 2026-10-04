import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const { token } = useAuth();

  // Already logged in? Never show the login form.
  if (token) return <Navigate to="/select-app" replace />;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Access site records, surveys, and updates."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      <LoginForm />
    </AuthLayout>
  );
}