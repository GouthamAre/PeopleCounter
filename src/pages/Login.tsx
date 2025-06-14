import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import VantaCloudBackground from "@/components/VantaCloudBackground";
import { useAuth } from "@/lib/mockAuth"; // ✅ use mock auth



const Login = () => {
  const navigate = useNavigate();
   // ✅ use mock login

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    // ✅ trigger login
    toast.success("Logged in successfully!");
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VantaCloudBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md p-8 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-black drop-shadow">Sign In</h1>
          <p className="text-black/90 mt-2 text-sm">Access your account below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-black">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-100 font-semibold">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-black">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-200 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
