import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../common/Input";
import Button from "../common/Button";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nic: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // Client-side validation
    const nextErrors = {};
    if (!form.nic) nextErrors.nic = "NIC is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await login({ nic: form.nic, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        id="nic"
        name="nic"
        type="text"
        label="NIC"
        placeholder="123456789V"
        value={form.nic}
        onChange={handleChange}
        error={errors.nic}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />

      {apiError && (
        <p className="text-sm text-red-500 -mt-1">{apiError}</p>
      )}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
