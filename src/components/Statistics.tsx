import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Clock, ArrowUpRight, ArrowDownRight, UserCircle2, User } from "lucide-react";

interface StatisticsProps {
  currentCount?: number;
  maleCount?: number;
  femaleCount?: number;
}

type ActivityType = "entry" | "exit";

interface Activity {
  type: ActivityType;
  time: string;
  count: number;
  maleCount?: number;
  femaleCount?: number;
}

const Statistics = ({ 
  currentCount = 0, 
  maleCount = 0, 
  femaleCount = 0 
}: StatisticsProps) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (currentCount !== undefined) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      
      const prevActivity = activities[0];
      const prevCount = prevActivity ? prevActivity.count : 0;
      
      if (currentCount !== prevCount) {
        const type: ActivityType = currentCount > prevCount ? "entry" : "exit";
        
        setActivities(prev => [{
          type,
          time: timeString,
          count: currentCount,
          maleCount,
          femaleCount,
        }, ...prev].slice(0, 5));
      }
    }
  }, [currentCount, activities, maleCount, femaleCount]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="p-6 bg-white/80 backdrop-blur border-zinc-200/50">
        <h3 className="text-sm font-medium text-zinc-500 mb-4">Current Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-full">
                <Users className="w-4 h-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">People Count</p>
                <p className="text-2xl font-bold text-zinc-900">{currentCount}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">Male</p>
                <p className="text-xl font-bold text-zinc-900">{maleCount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <UserCircle2 className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">Female</p>
                <p className="text-xl font-bold text-zinc-900">{femaleCount}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-full">
                <Clock className="w-4 h-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">Session Time</p>
                <p className="text-2xl font-bold text-zinc-900">{formatTime(sessionTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/80 backdrop-blur border-zinc-200/50">
        <h3 className="text-sm font-medium text-zinc-500 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <ActivityItem 
                key={index}
                type={activity.type}
                time={activity.time}
                count={activity.count}
                maleCount={activity.maleCount}
                femaleCount={activity.femaleCount}
              />
            ))
          ) : (
            <ActivityItem
              type="entry"
              time="Waiting for activity..."
              count={currentCount}
              maleCount={maleCount}
              femaleCount={femaleCount}
            />
          )}
        </div>
      </Card>
    </motion.div>
  );
};

interface ActivityItemProps {
  type: ActivityType;
  time: string;
  count: number;
  maleCount?: number;
  femaleCount?: number;
}

const ActivityItem = ({ type, time, count, maleCount = 0, femaleCount = 0 }: ActivityItemProps) => {
  const isEntry = type === "entry";
  
  return (
    <div className="flex flex-col p-3 bg-zinc-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isEntry ? "bg-emerald-100" : "bg-amber-100"}`}>
            {isEntry ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {isEntry ? "Entry" : "Exit"}
            </p>
            <p className="text-xs text-zinc-500">{time}</p>
          </div>
        </div>
        <span className="text-sm font-medium text-zinc-600">
          Count: {count}
        </span>
      </div>
      
      <div className="flex gap-3 mt-2 ml-9 text-xs">
        <span className="flex items-center gap-1 text-blue-600">
          <User className="w-3 h-3" /> {maleCount}
        </span>
        <span className="flex items-center gap-1 text-pink-600">
          <UserCircle2 className="w-3 h-3" /> {femaleCount}
        </span>
      </div>
    </div>
  );
};

export default Statistics;
