import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
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
