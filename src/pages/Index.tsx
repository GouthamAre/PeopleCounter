import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import VantaCloudBackground from "@/components/VantaCloudBackground"; // CLOUDS background

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VantaCloudBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center px-6"
      >
        <div className="mb-3">
          <span className="px-3 py-1 text-xs font-semibold bg-black/60 text-white rounded-full shadow-md">
            Real-time Analysis
          </span>
        </div>

        <h1 className="text-5xl font-bold text-black drop-shadow-lg mb-4">
          People Counter
        </h1>
        <p className="text-black/90 mb-10 max-w-xl mx-auto text-lg drop-shadow-sm">
          Advanced real-time people counting using machine learning. Login or sign up to begin monitoring.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Button
            onClick={() => navigate("/login")}
            className="rounded-full px-8 py-6 bg-white text-black hover:bg-zinc-100 font-semibold shadow-lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </Button>

          <Button
            onClick={() => navigate("/signup")}
            className="rounded-full px-8 py-6 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold shadow-lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
