import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Search, Eye, FileText, Users, MapPin, Clock, Check, X, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Clue {
  id: number;
  type: "witness" | "evidence" | "location" | "document";
  title: string;
  description: string;
  discovered: boolean;
  relevance: "key" | "helpful" | "misleading";
}

interface Suspect {
  id: number;
  name: string;
  description: string;
  alibi: string;
  motive: string;
  isGuilty: boolean;
}

interface Case {
  id: number;
  title: string;
  difficulty: "junior" | "detective" | "master";
  category: string;
  introduction: string;
  clues: Clue[];
  suspects: Suspect[];
  solution: string;
  timeLimit: number;
}

const CASES: Case[] = [
  {
    id: 1,
    title: "The Missing Library Book",
    difficulty: "junior",
    category: "AIR - Critical Thinking",
    introduction: "The school's favorite book, 'The Adventures of Captain Courage,' has gone missing from the library! Mrs. Chen, the librarian, noticed it was gone after lunch. Can you find out who took it and why?",
    timeLimit: 600,
    clues: [
      {
        id: 1,
        type: "witness",
        title: "Librarian's Statement",
        description: "Mrs. Chen says: 'The book was on the shelf at 11:30 AM. I went to lunch at 12:00 PM and returned at 1:00 PM. That's when I noticed it was missing.'",
        discovered: false,
        relevance: "key",
      },
      {
        id: 2,
        type: "evidence",
        title: "Bookmark Found",
        description: "A blue bookmark with the initials 'S.J.' was found near the empty shelf space.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 3,
        type: "location",
        title: "Library Sign-In Sheet",
        description: "Three students signed in during lunch: Sam Johnson (12:15), Maria Garcia (12:30), and Tom Wilson (12:45).",
        discovered: false,
        relevance: "key",
      },
      {
        id: 4,
        type: "document",
        title: "Book Request Form",
        description: "A request form shows Sam Johnson asked to check out the book last week but it was already reserved.",
        discovered: false,
        relevance: "helpful",
      },
      {
        id: 5,
        type: "witness",
        title: "Janitor's Observation",
        description: "Mr. Brown the janitor says: 'I saw a student with a blue backpack leaving the library around 12:20.'",
        discovered: false,
        relevance: "helpful",
      },
    ],
    suspects: [
      {
        id: 1,
        name: "Sam Johnson",
        description: "5th grader, loves adventure books, has a blue backpack",
        alibi: "Says he was just looking for a different book",
        motive: "Wanted to read the book but couldn't check it out officially",
        isGuilty: true,
      },
      {
        id: 2,
        name: "Maria Garcia",
        description: "4th grader, prefers science books",
        alibi: "Was researching for a science project",
        motive: "None apparent",
        isGuilty: false,
      },
      {
        id: 3,
        name: "Tom Wilson",
        description: "5th grader, usually reads comics",
        alibi: "Was returning overdue books",
        motive: "None apparent",
        isGuilty: false,
      },
    ],
    solution: "Sam Johnson took the book. The bookmark with 'S.J.' initials matches his name, he was seen leaving at 12:20 with a blue backpack, and he had previously tried to check out the book but couldn't.",
  },
  {
    id: 2,
    title: "The Garden Mystery",
    difficulty: "junior",
    category: "LAND - Observation",
    introduction: "Someone has been taking vegetables from the community garden at night! The gardeners have noticed tomatoes, carrots, and lettuce disappearing. Help solve this mystery!",
    timeLimit: 600,
    clues: [
      {
        id: 1,
        type: "evidence",
        title: "Footprints",
        description: "Small animal footprints were found near the tomato plants. They look like they have long toes.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 2,
        type: "location",
        title: "Fence Hole",
        description: "A small hole was found under the garden fence, just big enough for a small animal.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 3,
        type: "evidence",
        title: "Bite Marks",
        description: "The remaining vegetables have small, clean bite marks - not human-sized.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 4,
        type: "witness",
        title: "Neighbor's Report",
        description: "Mrs. Patterson says: 'I've seen a family of rabbits living under my shed next door.'",
        discovered: false,
        relevance: "helpful",
      },
      {
        id: 5,
        type: "evidence",
        title: "Fur Sample",
        description: "Brown and white fur was found caught on the fence near the hole.",
        discovered: false,
        relevance: "helpful",
      },
    ],
    suspects: [
      {
        id: 1,
        name: "Neighborhood Kids",
        description: "Some kids were seen playing near the garden",
        alibi: "Parents confirm they were home at night",
        motive: "Might want free snacks",
        isGuilty: false,
      },
      {
        id: 2,
        name: "Rabbits",
        description: "A family of rabbits living nearby",
        alibi: "Animals don't have alibis!",
        motive: "Hungry for fresh vegetables",
        isGuilty: true,
      },
      {
        id: 3,
        name: "Squirrels",
        description: "Several squirrels live in the oak tree",
        alibi: "Usually active during the day",
        motive: "Might eat some vegetables",
        isGuilty: false,
      },
    ],
    solution: "Rabbits are the culprits! The small footprints with long toes match rabbit tracks, the hole under the fence is rabbit-sized, the bite marks are too small for humans, and rabbit fur was found on the fence.",
  },
  {
    id: 3,
    title: "The Missing Lunch Money",
    difficulty: "detective",
    category: "SELF - Problem Solving",
    introduction: "Three students reported their lunch money missing from their backpacks during gym class. All backpacks were left in the locker room. Who could have taken the money?",
    timeLimit: 900,
    clues: [
      {
        id: 1,
        type: "location",
        title: "Locker Room Access Log",
        description: "Only 4 people entered the locker room during gym: Coach Davis (checking equipment), Alex Reed (forgot inhaler), the janitor (cleaning), and a delivery person (dropping off supplies).",
        discovered: false,
        relevance: "key",
      },
      {
        id: 2,
        type: "witness",
        title: "Coach's Statement",
        description: "Coach Davis says: 'I was only in there for 2 minutes to grab some cones. I didn't see anyone else.'",
        discovered: false,
        relevance: "helpful",
      },
      {
        id: 3,
        type: "evidence",
        title: "Candy Wrapper",
        description: "A fresh candy wrapper was found near the affected backpacks. It's from the vending machine in the main hall.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 4,
        type: "witness",
        title: "Janitor's Account",
        description: "The janitor says: 'I saw Alex by the backpacks. He said he was looking for his inhaler.'",
        discovered: false,
        relevance: "key",
      },
      {
        id: 5,
        type: "document",
        title: "Vending Machine Receipt",
        description: "A receipt timestamped during gym class shows someone bought candy. Alex's student ID was used.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 6,
        type: "evidence",
        title: "Alex's Backpack",
        description: "Alex's backpack contains 3 candy bars from the vending machine and more cash than his parents gave him.",
        discovered: false,
        relevance: "key",
      },
    ],
    suspects: [
      {
        id: 1,
        name: "Alex Reed",
        description: "Student who returned for his inhaler",
        alibi: "Claims he only grabbed his inhaler and left",
        motive: "Wanted money for candy",
        isGuilty: true,
      },
      {
        id: 2,
        name: "Coach Davis",
        description: "Gym teacher",
        alibi: "Was getting equipment, verified by other teachers",
        motive: "None",
        isGuilty: false,
      },
      {
        id: 3,
        name: "Janitor",
        description: "School maintenance staff",
        alibi: "Was cleaning, has worked at school for 15 years with no incidents",
        motive: "None apparent",
        isGuilty: false,
      },
      {
        id: 4,
        name: "Delivery Person",
        description: "External visitor",
        alibi: "Signed in and out within 5 minutes, escorted by office staff",
        motive: "None",
        isGuilty: false,
      },
    ],
    solution: "Alex Reed took the money. He used his 'inhaler' excuse to access the locker room, took money from backpacks, and immediately bought candy from the vending machine (proven by the receipt with his student ID). The candy wrapper and extra cash in his backpack confirm his guilt.",
  },
  {
    id: 4,
    title: "The Science Fair Sabotage",
    difficulty: "master",
    category: "WATER - Emotional Intelligence",
    introduction: "The night before the science fair, someone damaged three students' projects. The school is in an uproar. As the lead detective, you must find out who did this and understand why.",
    timeLimit: 1200,
    clues: [
      {
        id: 1,
        type: "location",
        title: "Security Camera Footage",
        description: "Cameras show a figure in a dark hoodie entering the gym at 7:45 PM. The face isn't visible, but they're wearing distinctive white sneakers.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 2,
        type: "evidence",
        title: "Damaged Projects",
        description: "Only projects from students in the 'Advanced' category were damaged. All three were strong contenders for first place.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 3,
        type: "document",
        title: "Competition History",
        description: "Records show Jordan Kim has entered the science fair 4 times and never won. This year, Jordan was moved to the 'Intermediate' category.",
        discovered: false,
        relevance: "helpful",
      },
      {
        id: 4,
        type: "witness",
        title: "Custodian's Report",
        description: "The custodian saw Jordan's car in the parking lot around 7:30 PM. Jordan claimed to be 'checking on their project.'",
        discovered: false,
        relevance: "key",
      },
      {
        id: 5,
        type: "evidence",
        title: "White Sneaker Print",
        description: "A white sneaker print was found near the damaged projects. It matches a popular brand that Jordan was seen wearing earlier that day.",
        discovered: false,
        relevance: "key",
      },
      {
        id: 6,
        type: "witness",
        title: "Friend's Confession",
        description: "Jordan's friend admits: 'Jordan was really upset about being moved to Intermediate. Said it wasn't fair that others would win just because they were in Advanced.'",
        discovered: false,
        relevance: "key",
      },
      {
        id: 7,
        type: "document",
        title: "Jordan's Journal Entry",
        description: "A journal entry reads: 'If I can't win fairly, maybe no one should win. I'm tired of being overlooked.'",
        discovered: false,
        relevance: "key",
      },
    ],
    suspects: [
      {
        id: 1,
        name: "Jordan Kim",
        description: "Intermediate category competitor, 4-time participant",
        alibi: "Claims to have left after checking project",
        motive: "Frustrated about category placement and never winning",
        isGuilty: true,
      },
      {
        id: 2,
        name: "Riley Chen",
        description: "Advanced category competitor",
        alibi: "Was at a family dinner, verified by restaurant receipt",
        motive: "Would benefit from less competition",
        isGuilty: false,
      },
      {
        id: 3,
        name: "Teacher's Assistant",
        description: "Helped set up the fair",
        alibi: "Left at 6 PM, verified by sign-out sheet",
        motive: "None",
        isGuilty: false,
      },
      {
        id: 4,
        name: "Parent Volunteer",
        description: "Helped with decorations",
        alibi: "Was at home, verified by family",
        motive: "None apparent",
        isGuilty: false,
      },
    ],
    solution: "Jordan Kim sabotaged the projects. The evidence shows: Jordan was at school at the time of the incident, wears distinctive white sneakers matching the print, had strong emotional motive (frustration about category placement and never winning), and the journal entry reveals intent. This case also teaches about how unchecked emotions can lead to poor decisions.",
  },
];

export default function DetectiveAcademy() {
  const [, setLocation] = useLocation();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [discoveredClues, setDiscoveredClues] = useState<number[]>([]);
  const [accusedSuspect, setAccusedSuspect] = useState<Suspect | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [gamePhase, setGamePhase] = useState<"investigate" | "accuse" | "result">("investigate");
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [caseResult, setCaseResult] = useState<"solved" | "wrong" | "timeout" | null>(null);

  // Timer
  useEffect(() => {
    if (!gameStarted || gamePhase === "result" || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCaseResult("timeout");
          setGamePhase("result");
          toast.error("Time's up! The case went cold.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gamePhase, isPaused]);

  const startCase = (caseData: Case) => {
    setSelectedCase(caseData);
    setDiscoveredClues([]);
    setAccusedSuspect(null);
    setShowSolution(false);
    setGamePhase("investigate");
    setTimeLeft(caseData.timeLimit);
    setGameStarted(true);
    setIsPaused(false);
    setCaseResult(null);
  };

  const discoverClue = (clueId: number) => {
    if (isPaused || discoveredClues.includes(clueId)) return;
    setDiscoveredClues((prev) => [...prev, clueId]);
    toast.success("New clue discovered!");
  };

  const makeAccusation = (suspect: Suspect) => {
    setAccusedSuspect(suspect);
    if (suspect.isGuilty) {
      setCaseResult("solved");
      toast.success("Case Solved! You found the culprit!");
    } else {
      setCaseResult("wrong");
      toast.error("Wrong suspect! Review the evidence again.");
    }
    setGamePhase("result");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getClueIcon = (type: string) => {
    switch (type) {
      case "witness": return <Users className="w-4 h-4" />;
      case "evidence": return <Search className="w-4 h-4" />;
      case "location": return <MapPin className="w-4 h-4" />;
      case "document": return <FileText className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "junior": return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "detective": return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "master": return "text-red-500 bg-red-100 dark:bg-red-900/30";
      default: return "";
    }
  };

  const resetGame = () => {
    setSelectedCase(null);
    setGameStarted(false);
    setGamePhase("investigate");
    setCaseResult(null);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center mb-6">
            <Search className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">🔍 Detective Academy</h1>
            <p className="text-muted-foreground mb-4">
              Solve mysteries, gather clues, and catch the culprit!
            </p>
            <p className="text-sm text-muted-foreground">
              Learn critical thinking, observation, and deduction skills.
            </p>
          </Card>

          <div className="space-y-4">
            {CASES.map((caseData) => (
              <Card
                key={caseData.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => startCase(caseData)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔍</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{caseData.title}</h3>
                      <span className={`text-xs font-medium capitalize px-2 py-1 rounded ${getDifficultyColor(caseData.difficulty)}`}>
                        {caseData.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {caseData.introduction}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(caseData.timeLimit / 60)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {caseData.clues.length} clues
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {caseData.suspects.length} suspects
                      </span>
                      <span>{caseData.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === "result") {
    const cluesFound = discoveredClues.length;
    const totalClues = selectedCase?.clues.length || 0;
    const keyCluesFound = selectedCase?.clues.filter(
      (c) => c.relevance === "key" && discoveredClues.includes(c.id)
    ).length || 0;
    const totalKeyClues = selectedCase?.clues.filter((c) => c.relevance === "key").length || 0;
    
    let score = 0;
    if (caseResult === "solved") {
      score = 100;
      score += Math.floor((timeLeft / (selectedCase?.timeLimit || 1)) * 50); // Time bonus
      score -= (totalClues - cluesFound) * 5; // Penalty for missed clues
    } else if (caseResult === "wrong") {
      score = Math.floor((cluesFound / totalClues) * 30); // Partial credit for investigation
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            {caseResult === "solved" ? (
              <>
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Case Solved! 🎉</h2>
              </>
            ) : caseResult === "wrong" ? (
              <>
                <X className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Wrong Suspect</h2>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
              </>
            )}
            
            <p className="text-muted-foreground mb-4">{selectedCase?.title}</p>
            
            <div className="space-y-2 mb-4 text-sm text-left bg-muted p-4 rounded-lg">
              <p><strong>Clues found:</strong> {cluesFound}/{totalClues}</p>
              <p><strong>Key clues found:</strong> {keyCluesFound}/{totalKeyClues}</p>
              {caseResult === "solved" && (
                <p><strong>Time remaining:</strong> {formatTime(timeLeft)}</p>
              )}
              <p className="text-xl font-bold text-center text-primary mt-4">
                Score: {score}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowSolution(!showSolution)}
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>

            {showSolution && (
              <div className="text-left bg-muted p-4 rounded-lg mb-4 text-sm">
                <p className="font-semibold mb-2">Solution:</p>
                <p>{selectedCase?.solution}</p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame}>More Cases</Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/game-center")}
              >
                Back to Games
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={resetGame}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Case
          </Button>
          <div className="text-center">
            <h2 className="font-semibold text-sm">{selectedCase?.title}</h2>
            <span className={`text-xl font-bold ${timeLeft <= 60 ? "text-red-500" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Investigation Paused</p>
          </Card>
        )}

        {/* Case Introduction */}
        <Card className="p-4 mb-4">
          <p className="text-sm">{selectedCase?.introduction}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Clues Section */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Evidence & Clues ({discoveredClues.length}/{selectedCase?.clues.length})
            </h3>
            <div className="space-y-2">
              {selectedCase?.clues.map((clue) => {
                const isDiscovered = discoveredClues.includes(clue.id);
                return (
                  <Card
                    key={clue.id}
                    className={`p-3 cursor-pointer transition-all ${
                      isDiscovered
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-accent"
                    } ${isPaused ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => discoverClue(clue.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${isDiscovered ? "text-primary" : "text-muted-foreground"}`}>
                        {getClueIcon(clue.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{clue.title}</span>
                          <span className="text-xs capitalize text-muted-foreground">
                            {clue.type}
                          </span>
                        </div>
                        {isDiscovered ? (
                          <p className="text-sm text-muted-foreground mt-1">
                            {clue.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            Click to investigate...
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Suspects Section */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Suspects
            </h3>
            <div className="space-y-2">
              {selectedCase?.suspects.map((suspect) => (
                <Card key={suspect.id} className={`p-3 ${isPaused ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{suspect.name}</h4>
                      <p className="text-xs text-muted-foreground">{suspect.description}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p><strong>Alibi:</strong> {suspect.alibi}</p>
                        <p><strong>Motive:</strong> {suspect.motive}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => makeAccusation(suspect)}
                      disabled={isPaused || discoveredClues.length < 3}
                    >
                      Accuse
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {discoveredClues.length < 3 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Discover at least 3 clues before making an accusation
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
          <span>Clues: {discoveredClues.length}/{selectedCase?.clues.length}</span>
          <span>•</span>
          <span>Phase: Investigation</span>
        </div>
      </div>
    </div>
  );
}
