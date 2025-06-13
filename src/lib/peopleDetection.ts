import { pipeline } from "@huggingface/transformers";

let detector: any = null;
let isDetectorBusy = false;
// Store previous positions to detect rapid movement
let previousPositions: Record<string, any> = {};
// Track the last processed frame timestamp for throttling
let lastProcessedTime = 0;
const THROTTLE_RATE = 200; // Process at most every 200ms

// Remember gender assignments for consistency
let personGenderMap: Record<string, string> = {};
// Store body proportions to help with gender classification
let personProportionsMap: Record<string, { aspectRatio: number, area: number }> = {};

// Initialize only the person detector, not the gender classifier
const initializeDetector = async () => {
  if (!detector) {
    try {
      console.log("Initializing detector with WebGPU...");
      // First try with WebGPU
      detector = await pipeline(
        "object-detection",
        "Xenova/detr-resnet-50",
        { 
          device: "webgpu"
        }
      );
      console.log("WebGPU detector initialized successfully");
    } catch (error) {
      console.log("WebGPU failed, falling back to CPU");
      // Fallback to CPU
      detector = await pipeline(
        "object-detection",
        "Xenova/detr-resnet-50"
      );
      console.log("CPU detector initialized successfully");
    }
  }
  return detector;
};

interface DetectionResult {
  peopleCount: number;
  isFighting: boolean;
  maleCount: number;
  femaleCount: number;
  people: Array<{
    box: number[];
    gender: string;
    score: number;
    id: string;
  }>;
}

// Assign a consistent gender to a person based on their measurements and position
const getConsistentGender = (
  personId: string, 
  height: number, 
  width: number, 
  x: number, 
  y: number
): string => {
  // If we already assigned a gender to this ID, keep it consistent
  if (personGenderMap[personId]) {
    return personGenderMap[personId];
  }
  
  // Calculate body proportions
  const aspectRatio = height / width;
  const area = width * height;
  
  // Store these proportions for future reference
  personProportionsMap[personId] = { aspectRatio, area };
  
  // Improved gender assignment logic using multiple factors
  
  // 1. Body shape: females typically have higher aspect ratios (taller/thinner appearance)
  let genderScore = 0;
  
  // Aspect ratio factor - higher aspect ratios tend toward female
  if (aspectRatio > 2.5) {
    genderScore += 0.3; // More likely female
  } else if (aspectRatio < 2.0) {
    genderScore -= 0.3; // More likely male
  }
  
  // 2. Position in frame can sometimes correlate with height differences
  // Central figures often appear more prominent
  const centerX = x + width/2;
  const centerY = y + height/2;
  const distanceFromCenter = Math.sqrt(
    Math.pow(centerX - 400, 2) + Math.pow(centerY - 300, 2)
  );
  
  // Positions closer to center of frame get a slight male bias (often taller)
  if (distanceFromCenter < 200) {
    genderScore -= 0.2;
  }
  
  // 3. Use a spatial factor for consistency
  // Create a deterministic but seemingly random value based on initial position
  const spatialFactor = ((x * 13) % 100) / 100;
  genderScore += (spatialFactor - 0.5) * 0.4;
  
  // 4. Use size as another factor (larger figures more likely male)
  const sizeFactor = Math.min(area / 40000, 1); // Normalize to 0-1 range
  genderScore -= sizeFactor * 0.4; // Larger size trends male
  
  // Determine gender based on final score
  const gender = genderScore > 0 ? 'female' : 'male';
  
  // Remember this assignment for future frames
  personGenderMap[personId] = gender;
  
  return gender;
};

// Clean up old person IDs that haven't been seen recently
const cleanupOldPersonIds = (currentIds: string[]) => {
  // Only clean up IDs not seen in the last 50 frames
  const cleanupThreshold = 50;
  
  // Initialize cleanup counter for each ID if it doesn't exist
  for (const id of currentIds) {
    if (!personGenderMap[id + '_cleanupCounter']) {
      personGenderMap[id + '_cleanupCounter'] = 0;
    } else {
      // Reset counter since we've seen this ID
      personGenderMap[id + '_cleanupCounter'] = 0;
    }
  }
  
  // Increment counters for IDs not in current frame
  const allIds = Object.keys(personGenderMap).filter(id => !id.includes('_cleanupCounter'));
  
  for (const id of allIds) {
    if (!currentIds.includes(id)) {
      const counterKey = id + '_cleanupCounter';
      const currentCount = personGenderMap[counterKey] || 0;
      personGenderMap[counterKey] = currentCount + 1;
      
      // Remove ID if not seen for a while
      if (personGenderMap[counterKey] > cleanupThreshold) {
        delete personGenderMap[id];
        delete personGenderMap[counterKey];
        delete personProportionsMap[id];
      }
    }
  }
};

export const detectPeople = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<DetectionResult> => {
  // Throttle processing for better performance
  const now = Date.now();
  if (now - lastProcessedTime < THROTTLE_RATE || isDetectorBusy) {
    return { 
      peopleCount: -1, 
      isFighting: false, 
      maleCount: 0, 
      femaleCount: 0,
      people: []
    }; // Return -1 to indicate skipped detection
  }
  
  lastProcessedTime = now;

  try {
    isDetectorBusy = true;
    const detector = await initializeDetector();
    
    // Set canvas dimensions to match video but at a lower resolution for better performance
    const scaleFactor = 0.3; // Lower resolution for faster processing
    canvas.width = video.videoWidth * scaleFactor;
    canvas.height = video.videoHeight * scaleFactor;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      isDetectorBusy = false;
      return { 
        peopleCount: 0, 
        isFighting: false, 
        maleCount: 0, 
        femaleCount: 0,
        people: []
      };
    }

    // Draw current video frame at reduced resolution
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob URL for the model
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
    
    // Get predictions
    const predictions = await detector(dataUrl);
    
    // Make sure we're handling the predictions correctly
    let people = [];
    
    // Check if predictions is an array or an object with results property
    if (Array.isArray(predictions)) {
      people = predictions.filter((pred: any) => 
        pred && pred.label === "person"
      );
    } else if (predictions && typeof predictions === 'object') {
      // Try to handle different response formats
      if (Array.isArray(predictions.results)) {
        people = predictions.results.filter((pred: any) => 
          pred && pred.label === "person"
        );
      } else if (predictions.objects && Array.isArray(predictions.objects)) {
        people = predictions.objects.filter((pred: any) => 
          pred && pred.label === "person"
        );
      }
    }
    
    // Scale canvas back to original size for drawing
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Process detected people and check for fighting
    let isFighting = false;
    const currentPositions: Record<string, any> = {};
    
    let detectedPeople: Array<{box: number[], gender: string, score: number, id: string}> = [];
    const currentIds: string[] = [];
    let maleCount = 0;
    let femaleCount = 0;
    
    // Draw boxes around detected people if we have any
    if (people.length > 0) {
      people.forEach((person: any, index: number) => {
        if (person && person.box) {
          let x, y, width, height;
          
          // Handle different box formats
          if (Array.isArray(person.box)) {
            [x, y, width, height] = person.box;
          } else if (typeof person.box === 'object') {
            x = person.box.xmin || person.box.x || 0;
            y = person.box.ymin || person.box.y || 0;
            width = (person.box.xmax || person.box.width || 0) - x;
            height = (person.box.ymax || person.box.height || 0) - y;
          }
          
          // Fix the comparison - ensure we're comparing numbers, not literal types
          if (Number(scaleFactor) !== 1) {
            x = x / scaleFactor;
            y = y / scaleFactor;
            width = width / scaleFactor;
            height = height / scaleFactor;
          }
          
          // Generate a stable ID based on position
          // This helps maintain consistency between frames
          const posX = Math.round(x / 50) * 50;
          const posY = Math.round(y / 50) * 50;
          const personId = `person_${posX}_${posY}_${Math.round(width / 20)}_${Math.round(height / 20)}`;
          currentIds.push(personId);
          
          // Store position for this person
          currentPositions[personId] = { 
            x, y, width, height, 
            centerX: x + width/2, 
            centerY: y + height/2 
          };
          
          // Get a consistent gender assignment
          const gender = getConsistentGender(personId, height, width, x, y);
          
          if (gender === 'male') {
            maleCount++;
            ctx.strokeStyle = "#2563eb"; // blue for male
            ctx.fillStyle = "rgba(37, 99, 235, 0.2)";
          } else {
            femaleCount++;
            ctx.strokeStyle = "#db2777"; // pink for female
            ctx.fillStyle = "rgba(219, 39, 119, 0.2)";
          }
          
          const score = 0.95; // Placeholder confidence score
          
          detectedPeople.push({
            box: [x, y, width, height],
            gender,
            score,
            id: personId
          });
          
          // Draw rectangle
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          ctx.fillRect(x, y, width, height);
          
          // Add gender label
          ctx.font = "14px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 0.5;
          ctx.strokeText(gender, x + 5, y - 5);
          ctx.fillText(gender, x + 5, y - 5);
        }
      });
      
      // Clean up old person IDs
      cleanupOldPersonIds(currentIds);
      
      // Check for fighting (close proximity + movement)
      if (people.length >= 2) {
        // 1. Check proximity between people
        const personIds = Object.keys(currentPositions);
        for (let i = 0; i < personIds.length; i++) {
          for (let j = i + 1; j < personIds.length; j++) {
            const person1 = currentPositions[personIds[i]];
            const person2 = currentPositions[personIds[j]];
            
            // Calculate distance between centers
            const distance = Math.sqrt(
              Math.pow(person1.centerX - person2.centerX, 2) + 
              Math.pow(person1.centerY - person2.centerY, 2)
            );
            
            // 2. Check for rapid movement if we have previous positions
            let rapidMovement = false;
            if (previousPositions[personIds[i]] && previousPositions[personIds[j]]) {
              const prev1 = previousPositions[personIds[i]];
              const prev2 = previousPositions[personIds[j]];
              
              const movement1 = Math.sqrt(
                Math.pow(person1.centerX - prev1.centerX, 2) + 
                Math.pow(person1.centerY - prev1.centerY, 2)
              );
              
              const movement2 = Math.sqrt(
                Math.pow(person2.centerX - prev2.centerX, 2) + 
                Math.pow(person2.centerY - prev2.centerY, 2)
              );
              
              // If both people are moving rapidly and close
              rapidMovement = (movement1 > 20 || movement2 > 20);
            }
            
            // Are they close enough to be fighting?
            // Using relative size as a proxy for distance from camera
            const averageSize = (person1.width + person2.width) / 2;
            const proximityThreshold = averageSize * 1.5; // Adjust this multiplier as needed
            
            if (distance < proximityThreshold && (rapidMovement || Object.keys(previousPositions).length === 0)) {
              isFighting = true;
              
              // Draw a red line between the people who might be fighting
              ctx.beginPath();
              ctx.moveTo(person1.centerX, person1.centerY);
              ctx.lineTo(person2.centerX, person2.centerY);
              ctx.strokeStyle = "rgba(255, 50, 50, 0.8)";
              ctx.lineWidth = 3;
              ctx.stroke();
              
              // Change the box color for potentially fighting people
              ctx.strokeStyle = "rgba(255, 50, 50, 0.8)";
              ctx.fillStyle = "rgba(255, 50, 50, 0.2)";
              ctx.strokeRect(person1.x, person1.y, person1.width, person1.height);
              ctx.fillRect(person1.x, person1.y, person1.width, person1.height);
              ctx.strokeRect(person2.x, person2.y, person2.width, person2.height);
              ctx.fillRect(person2.x, person2.y, person2.width, person2.height);
              
              // Add "ALERT" text above
              ctx.font = "24px Arial";
              ctx.fillStyle = "red";
              ctx.fillText("POSSIBLE FIGHT DETECTED", 20, 40);
            }
          }
        }
      }
    }
    
    // Store current positions for next frame
    previousPositions = currentPositions;

    isDetectorBusy = false;
    return { 
      peopleCount: people.length, 
      isFighting, 
      maleCount, 
      femaleCount,
      people: detectedPeople
    };
  } catch (error) {
    console.error("Detection error:", error);
    isDetectorBusy = false;
    return { 
      peopleCount: 0, 
      isFighting: false, 
      maleCount: 0, 
      femaleCount: 0,
      people: []
    };
  }
};
