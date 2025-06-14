import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, VideoOff, Video } from "lucide-react";
import CameraView from "@/components/CameraView";
import Statistics from "@/components/Statistics";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/mockAuth";
import { toast } from "sonner";

const Camera = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [peopleCount, setPeopleCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [isFighting, setIsFighting] = useState(false);
  

  const toggleCamera = () => {
    setIsActive((prev) => !prev);
  };

  const handlePeopleCountChange = (count: number) => {
    setPeopleCount(count);
  };

  const handleGenderCountsChange = (male: number, female: number) => {
    setMaleCount(male);
    setFemaleCount(female);
  };

  const handleFightDetection = (fighting: boolean) => {
    setIsFighting(fighting);
    if (fighting) {
      toast.warning("Possible fight detected!", {
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="max-w-7xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-4"
        >
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/home")}
              className="text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <Button
              variant="outline"
              onClick={toggleCamera}
              className="text-zinc-600 hover:text-zinc-900"
            >
              {isActive ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              {isActive ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CameraView
              isActive={isActive}
              onPeopleCountChange={handlePeopleCountChange}
              onGenderCountsChange={handleGenderCountsChange}
              onFightDetection={handleFightDetection}
            />
            {isFighting && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                <p className="font-bold">⚠️ Possible fighting detected!</p>
                <p className="text-sm">The system has detected potential violent behavior.</p>
              </div>
            )}
          </div>
          <div>
            <Statistics
              currentCount={peopleCount}
              maleCount={maleCount}
              femaleCount={femaleCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
