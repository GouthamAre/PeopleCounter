import { useEffect, useRef, useState, useCallback } from "react";
import { detectPeople } from "@/lib/peopleDetection";
import { useToast } from "@/hooks/use-toast";

interface CameraViewProps {
  isActive: boolean;
  onPeopleCountChange?: (count: number) => void;
  onGenderCountsChange?: (maleCount: number, femaleCount: number) => void;
  onFightDetection?: (fighting: boolean) => void;
}

const CameraView = ({ 
  isActive, 
  onPeopleCountChange,
  onGenderCountsChange,
  onFightDetection 
}: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [peopleCount, setPeopleCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [isFighting, setIsFighting] = useState(false);
  const animationFrameRef = useRef<number>();
  const fightAlertTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const runDetection = useCallback(async () => {
    if (
      !isActive ||
      !videoRef.current ||
      !canvasRef.current ||
      !isInitialized ||
      isProcessingRef.current
    ) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    isProcessingRef.current = true;

    try {
      const result = await detectPeople(videoRef.current, canvasRef.current);

      if (result.isFighting !== isFighting) {
        setIsFighting(result.isFighting);
        onFightDetection?.(result.isFighting);

        if (result.isFighting) {
          if (fightAlertTimeout.current) {
            clearTimeout(fightAlertTimeout.current);
          }

          fightAlertTimeout.current = setTimeout(() => {
            setIsFighting(false);
            onFightDetection?.(false);
          }, 10000);
        }
      }

      if (result.peopleCount !== peopleCount && result.peopleCount >= 0) {
        setPeopleCount(result.peopleCount);
        onPeopleCountChange?.(result.peopleCount);
      }

      if (
        (result.maleCount !== maleCount || result.femaleCount !== femaleCount) &&
        result.maleCount >= 0 &&
        result.femaleCount >= 0
      ) {
        setMaleCount(result.maleCount);
        setFemaleCount(result.femaleCount);
        onGenderCountsChange?.(result.maleCount, result.femaleCount);
      }
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      isProcessingRef.current = false;
      animationFrameRef.current = requestAnimationFrame(runDetection);
    }
  }, [
    isActive,
    isInitialized,
    peopleCount,
    maleCount,
    femaleCount,
    isFighting,
    onPeopleCountChange,
    onGenderCountsChange,
    onFightDetection,
  ]);

  useEffect(() => {
    if (isActive) {
      const initializeCamera = async () => {
        try {
          const constraints = {
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsInitialized(true);
            toast({
              title: "Camera Ready",
              description: "People detection is now active",
            });
          }
        } catch (error) {
          toast({
            title: "Camera Error",
            description: "Unable to access camera. Please check permissions.",
            variant: "destructive",
          });
        }
      };

      initializeCamera();
    } else {
      // Stop camera stream if inactive
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsInitialized(false);
    }

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (fightAlertTimeout.current) clearTimeout(fightAlertTimeout.current);
    };
  }, [isActive, toast]);

  useEffect(() => {
    if (isInitialized) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isInitialized, runDetection]);

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full rounded-lg" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default CameraView;
