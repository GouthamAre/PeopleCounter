import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, Users, BarChart4, Clock, Building } from "lucide-react";
import { useAuth } from "@/lib/mockAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">PeopleCount</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Real-time people counting solution
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-medium text-slate-900 dark:text-white">{user?.name || user?.email}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Account ID: {user?.id}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="text-slate-600 dark:text-slate-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Welcome back, {user?.name || "User"}
              </CardTitle>
              <CardDescription>
                Begin counting people in your venue with our advanced AI technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 my-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">Your AI-Powered Counter</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Our system uses advanced computer vision to accurately detect and count people in real-time.
                    Perfect for retail spaces, events, and facility management.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">How It Works</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Simply point your camera at the area you want to monitor. Our AI technology will identify human figures 
                    and provide accurate count data that you can use for analytics.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/camera")}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Counting Now
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <CardHeader>
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-slate-900 dark:text-white">Accurate Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Our AI model is trained to recognize humans in various poses, lighting conditions, and even in crowded scenes.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <CardHeader>
                <BarChart4 className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-slate-900 dark:text-white">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Get immediate insights about occupancy rates, peak hours, and traffic patterns to optimize your operations.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-slate-900 dark:text-white">History Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Review historical data to identify trends and make informed decisions about staffing and space management.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-slate-900 dark:bg-slate-800 text-white rounded-lg p-6 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <Building className="h-10 w-10 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Perfect for Businesses</h3>
              <p className="text-slate-300 mb-4">
                Whether you're managing a retail store, event venue, or corporate office, our people counting solution 
                provides valuable data to help you optimize space utilization and improve customer experience.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/camera")} 
                className="bg-transparent text-white border-white/30 hover:bg-white/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                Launch Counter
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
