import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../common/Input";
import Button from "../common/Button";

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    nic: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name) nextErrors.name = "Name is required";
    if (!form.nic) nextErrors.nic = "NIC is required";
    if (!form.password) nextErrors.password = "Password is required";
    if (form.confirm !== form.password)
      nextErrors.confirm = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    signup(form.nic);
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        id="name"
        name="name"
        label="Full name"
        placeholder="Jane Doe"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
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
      <Input
        id="confirm"
        name="confirm"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        value={form.confirm}
        onChange={handleChange}
        error={errors.confirm}
      />
      <Button type="submit" size="lg" className="mt-2 w-full">
        Create account
      </Button>
    </form>
  );
}
