import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
  const { token } = useAuth();

  // Already logged in? Never show the signup form.
  if (token) return <Navigate to="/select-app" replace />;

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up access to the site records dashboard."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <SignupForm />
    </AuthLayout>
  );
}