import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Code2, Play, RotateCcw, Lightbulb, CheckCircle, XCircle, Loader2,
  BookOpen, Cpu, Palette, Globe, Braces, Bot, Sparkles, ChevronRight,
  Terminal, FileCode, Layers, Zap
} from "lucide-react";
import { Streamdown } from "streamdown";

// Language configurations
const LANGUAGES = [
  { id: "html", name: "HTML/CSS", icon: Globe, color: "text-orange-500", description: "Web page structure & styling" },
  { id: "javascript", name: "JavaScript", icon: Braces, color: "text-yellow-500", description: "Web interactivity & logic" },
  { id: "python", name: "Python", icon: FileCode, color: "text-blue-500", description: "General programming & data science" },
  { id: "css", name: "CSS Art", icon: Palette, color: "text-pink-500", description: "Creative visual design with code" },
] as const;

// Starter templates
const TEMPLATES: Record<string, { title: string; code: string; description: string }[]> = {
  html: [
    {
      title: "My First Webpage",
      description: "Create a basic HTML page with headings and paragraphs",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f4f8; }
    h1 { color: #2d3748; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Welcome to My Website!</h1>
  <div class="card">
    <h2>About Me</h2>
    <p>Write something about yourself here...</p>
  </div>
  <div class="card">
    <h2>My Hobbies</h2>
    <ul>
      <li>Coding</li>
      <li>Reading</li>
      <li>Add your hobbies!</li>
    </ul>
  </div>
</body>
</html>`
    },
    {
      title: "Interactive Form",
      description: "Build a form with inputs, buttons, and styling",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Contact Form</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
    .form-container { background: white; padding: 30px; border-radius: 12px; width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    h2 { color: #4a5568; margin-top: 0; }
    label { display: block; margin: 12px 0 4px; color: #718096; font-size: 14px; }
    input, textarea { width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    input:focus, textarea:focus { border-color: #667eea; outline: none; }
    button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 16px; }
    button:hover { background: #5a67d8; }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>Contact Us</h2>
    <label>Name</label>
    <input type="text" placeholder="Your name">
    <label>Email</label>
    <input type="email" placeholder="your@email.com">
    <label>Message</label>
    <textarea rows="4" placeholder="Write your message..."></textarea>
    <button onclick="alert('Message sent!')">Send Message</button>
  </div>
</body>
</html>`
    },
  ],
  javascript: [
    {
      title: "Calculator",
      description: "Build a simple calculator with JavaScript",
      code: `// Simple Calculator
// Try changing the numbers and operations!

function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) return "Error: Cannot divide by zero!";
  return a / b;
}

// Test your calculator
console.log("=== My Calculator ===");
console.log("5 + 3 =", add(5, 3));
console.log("10 - 4 =", subtract(10, 4));
console.log("6 × 7 =", multiply(6, 7));
console.log("20 ÷ 4 =", divide(20, 4));

// Challenge: Create a function that calculates the area of a circle
// Hint: Area = π × radius²
function circleArea(radius) {
  return Math.PI * radius * radius;
}
console.log("\\nCircle with radius 5:", circleArea(5).toFixed(2));`
    },
    {
      title: "Array Adventures",
      description: "Learn arrays, loops, and data manipulation",
      code: `// Array Adventures - Learn to work with data!

const students = [
  { name: "Maya", grade: 92, subject: "Math" },
  { name: "James", grade: 88, subject: "Science" },
  { name: "Aisha", grade: 95, subject: "English" },
  { name: "Carlos", grade: 78, subject: "Math" },
  { name: "Zara", grade: 91, subject: "Science" },
];

// Find the average grade
const average = students.reduce((sum, s) => sum + s.grade, 0) / students.length;
console.log("Average grade:", average.toFixed(1));

// Find students with A grades (90+)
const aStudents = students.filter(s => s.grade >= 90);
console.log("\\nA students:", aStudents.map(s => s.name).join(", "));

// Sort by grade (highest first)
const sorted = [...students].sort((a, b) => b.grade - a.grade);
console.log("\\nRanking:");
sorted.forEach((s, i) => {
  console.log(\`  \${i + 1}. \${s.name} - \${s.grade} (\${s.subject})\`);
});

// Challenge: Add a new student and find who has the highest grade!`
    },
  ],
  python: [
    {
      title: "Python Basics",
      description: "Variables, loops, and functions in Python",
      code: `# Python Basics - Your First Program!
# (This runs as pseudocode in the browser simulator)

# Variables
name = "Student"
age = 14
favorite_subject = "Computer Science"

print(f"Hello! My name is {name}")
print(f"I am {age} years old")
print(f"My favorite subject is {favorite_subject}")

# Lists and Loops
grades = [92, 88, 95, 78, 91, 85]
print(f"\\nMy grades: {grades}")
print(f"Average: {sum(grades) / len(grades):.1f}")
print(f"Highest: {max(grades)}")
print(f"Lowest: {min(grades)}")

# Functions
def is_passing(grade):
    return grade >= 70

passing = [g for g in grades if is_passing(g)]
print(f"Passing grades: {len(passing)} out of {len(grades)}")

# Challenge: Write a function that converts Fahrenheit to Celsius
# Formula: C = (F - 32) × 5/9`
    },
    {
      title: "Data Science Intro",
      description: "Work with data like a real data scientist",
      code: `# Data Science Introduction
# Analyze real-world style data

weather_data = [
    {"month": "Jan", "temp": 32, "rain": 3.2},
    {"month": "Feb", "temp": 35, "rain": 2.8},
    {"month": "Mar", "temp": 45, "rain": 3.5},
    {"month": "Apr", "temp": 58, "rain": 3.1},
    {"month": "May", "temp": 68, "rain": 4.2},
    {"month": "Jun", "temp": 78, "rain": 3.8},
    {"month": "Jul", "temp": 85, "rain": 4.5},
    {"month": "Aug", "temp": 83, "rain": 4.1},
    {"month": "Sep", "temp": 75, "rain": 3.3},
    {"month": "Oct", "temp": 62, "rain": 2.9},
    {"month": "Nov", "temp": 48, "rain": 3.0},
    {"month": "Dec", "temp": 36, "rain": 3.4},
]

# Analysis
temps = [d["temp"] for d in weather_data]
avg_temp = sum(temps) / len(temps)
hottest = max(weather_data, key=lambda d: d["temp"])
coldest = min(weather_data, key=lambda d: d["temp"])
total_rain = sum(d["rain"] for d in weather_data)

print("=== Weather Data Analysis ===")
print(f"Average temperature: {avg_temp:.1f}°F")
print(f"Hottest month: {hottest['month']} ({hottest['temp']}°F)")
print(f"Coldest month: {coldest['month']} ({coldest['temp']}°F)")
print(f"Total rainfall: {total_rain:.1f} inches")

# Challenge: Find which season has the most rainfall`
    },
  ],
  css: [
    {
      title: "CSS Sunset",
      description: "Create a beautiful sunset scene with pure CSS",
      code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; overflow: hidden; }
  .scene { width: 100vw; height: 100vh; background: linear-gradient(to bottom, #1a0533 0%, #4a1942 20%, #c94b4b 40%, #f09819 55%, #f5d020 65%, #f09819 75%, #2d1b69 100%); position: relative; }
  .sun { width: 120px; height: 120px; background: radial-gradient(circle, #fff7a1, #ffcc33, #ff6600); border-radius: 50%; position: absolute; top: 35%; left: 50%; transform: translateX(-50%); box-shadow: 0 0 60px #ff9900, 0 0 120px #ff660066; }
  .water { position: absolute; bottom: 0; width: 100%; height: 35%; background: linear-gradient(to bottom, #1a0533aa, #0a0a2e); }
  .reflection { position: absolute; top: 5%; left: 50%; transform: translateX(-50%); width: 4px; height: 90%; background: linear-gradient(to bottom, #ffcc3366, #ff990033, transparent); filter: blur(3px); }
  .star { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; }
  .cloud { position: absolute; background: #ff660033; border-radius: 50px; height: 20px; }
</style>
</head>
<body>
  <div class="scene">
    <div class="star" style="top:5%;left:15%"></div>
    <div class="star" style="top:8%;left:80%"></div>
    <div class="star" style="top:12%;left:45%"></div>
    <div class="star" style="top:3%;left:65%"></div>
    <div class="cloud" style="top:30%;left:10%;width:150px;opacity:0.5"></div>
    <div class="cloud" style="top:25%;left:60%;width:200px;opacity:0.3"></div>
    <div class="sun"></div>
    <div class="water">
      <div class="reflection"></div>
    </div>
  </div>
</body>
</html>`
    },
  ],
};

// AI Builder challenges
const AI_CHALLENGES = [
  {
    id: "chatbot",
    title: "Build a Chatbot",
    difficulty: "Beginner",
    description: "Create a simple rule-based chatbot that responds to user input",
    concepts: ["Conditional Logic", "String Matching", "User Input"],
    starterCode: `// Simple Chatbot Builder
// The chatbot responds based on keywords in the user's message

function chatbot(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("hello") || msg.includes("hi")) {
    return "Hello! How can I help you today?";
  }
  if (msg.includes("weather")) {
    return "I can't check real weather, but I hope it's nice outside!";
  }
  if (msg.includes("name")) {
    return "I'm LAWS Bot, your AI assistant!";
  }
  if (msg.includes("help")) {
    return "I can chat about: weather, my name, jokes, or math!";
  }
  if (msg.includes("joke")) {
    return "Why do programmers prefer dark mode? Because light attracts bugs!";
  }
  
  // Add more responses here!
  return "Interesting! Tell me more about that.";
}

// Test conversations
const tests = ["Hello!", "What's your name?", "Tell me a joke", "How's the weather?", "What can you help with?"];
tests.forEach(msg => {
  console.log("You: " + msg);
  console.log("Bot: " + chatbot(msg));
  console.log("");
});

// Challenge: Add responses for "math", "time", and "goodbye"!`,
  },
  {
    id: "recommendation",
    title: "Recommendation Engine",
    difficulty: "Intermediate",
    description: "Build a system that recommends items based on user preferences",
    concepts: ["Data Structures", "Scoring Algorithms", "Filtering"],
    starterCode: `// Recommendation Engine
// Suggests books based on user preferences

const books = [
  { title: "The Alchemist", genre: "fiction", difficulty: "easy", topics: ["adventure", "philosophy", "dreams"] },
  { title: "Sapiens", genre: "nonfiction", difficulty: "medium", topics: ["history", "science", "society"] },
  { title: "Harry Potter", genre: "fiction", difficulty: "easy", topics: ["magic", "adventure", "friendship"] },
  { title: "Thinking Fast and Slow", genre: "nonfiction", difficulty: "hard", topics: ["psychology", "decisions", "science"] },
  { title: "The Hunger Games", genre: "fiction", difficulty: "medium", topics: ["adventure", "society", "survival"] },
  { title: "A Brief History of Time", genre: "nonfiction", difficulty: "hard", topics: ["science", "physics", "universe"] },
  { title: "Percy Jackson", genre: "fiction", difficulty: "easy", topics: ["mythology", "adventure", "friendship"] },
  { title: "Freakonomics", genre: "nonfiction", difficulty: "medium", topics: ["economics", "society", "decisions"] },
];

function recommend(preferences) {
  return books
    .map(book => {
      let score = 0;
      // Genre match
      if (book.genre === preferences.genre) score += 3;
      // Difficulty match
      if (book.difficulty === preferences.difficulty) score += 2;
      // Topic overlap
      const topicMatch = book.topics.filter(t => preferences.interests.includes(t)).length;
      score += topicMatch * 2;
      return { ...book, score };
    })
    .filter(b => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// Test it!
const userPrefs = { genre: "fiction", difficulty: "easy", interests: ["adventure", "friendship"] };
console.log("Your preferences:", JSON.stringify(userPrefs));
console.log("\\nRecommended books:");
recommend(userPrefs).forEach((b, i) => {
  console.log(\`  \${i+1}. \${b.title} (score: \${b.score})\`);
});

// Challenge: Add a "mood" factor and more books!`,
  },
  {
    id: "image-classifier",
    title: "Image Classifier Concept",
    difficulty: "Advanced",
    description: "Understand how AI classifies images using feature detection",
    concepts: ["Feature Extraction", "Pattern Matching", "Classification"],
    starterCode: `// AI Image Classifier Concept
// Learn how AI "sees" and classifies images using pixel patterns

// Simulated 5x5 pixel grids (0=black, 1=white)
const patterns = {
  "circle": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "square": [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ],
  "triangle": [
    [0,0,1,0,0],
    [0,1,0,1,0],
    [0,1,0,1,0],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ]
};

// Feature extraction (like a real CNN!)
function extractFeatures(grid) {
  const flat = grid.flat();
  const totalPixels = flat.filter(p => p === 1).length;
  const corners = [grid[0][0], grid[0][4], grid[4][0], grid[4][4]].filter(p => p === 1).length;
  const center = grid[2][2];
  const edges = flat.length - totalPixels;
  const symmetry = grid.every((row, i) => row[0] === row[4] && grid[i] !== undefined);
  return { totalPixels, corners, center, edges, symmetry };
}

// Classify by comparing features
function classify(unknownGrid) {
  const unknownFeatures = extractFeatures(unknownGrid);
  let bestMatch = { name: "unknown", similarity: 0 };
  
  for (const [name, pattern] of Object.entries(patterns)) {
    const patternFeatures = extractFeatures(pattern);
    let similarity = 0;
    if (patternFeatures.totalPixels === unknownFeatures.totalPixels) similarity += 2;
    if (patternFeatures.corners === unknownFeatures.corners) similarity += 3;
    if (patternFeatures.center === unknownFeatures.center) similarity += 1;
    if (patternFeatures.symmetry === unknownFeatures.symmetry) similarity += 1;
    if (similarity > bestMatch.similarity) bestMatch = { name, similarity };
  }
  return bestMatch;
}

// Test with known patterns
console.log("=== AI Image Classifier ===\\n");
for (const [name, pattern] of Object.entries(patterns)) {
  const features = extractFeatures(pattern);
  console.log(\`\${name}: pixels=\${features.totalPixels}, corners=\${features.corners}, center=\${features.center}\`);
}

// Test classification
const testGrid = [
  [0,1,1,1,0],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [0,1,1,1,0]
];
const result = classify(testGrid);
console.log(\`\\nClassification: \${result.name} (confidence: \${result.similarity}/7)\`);

// Challenge: Add a "diamond" pattern and update the classifier!`,
  },
];

export default function AcademyCodingSimulator() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState<string>("html");
  const [code, setCode] = useState(TEMPLATES.html[0].code);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [aiHint, setAiHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<typeof AI_CHALLENGES[0] | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // AI code review
  const reviewCode = trpc.academyK12.generateLessonContent.useMutation();

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput("");

    if (selectedLang === "html" || selectedLang === "css") {
      // Render HTML in iframe
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(code);
          doc.close();
        }
      }
      setOutput("✅ Rendered in preview panel");
      setIsRunning(false);
    } else if (selectedLang === "javascript") {
      // Execute JavaScript with console capture
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
          error: (...args: any[]) => logs.push("❌ " + args.join(" ")),
          warn: (...args: any[]) => logs.push("⚠️ " + args.join(" ")),
        };
        const fn = new Function("console", code);
        fn(mockConsole);
        setOutput(logs.join("\n") || "✅ Code executed (no output)");
      } catch (err: any) {
        setOutput("❌ Error: " + err.message);
      }
      setIsRunning(false);
    } else if (selectedLang === "python") {
      // Simulate Python execution (basic interpreter)
      try {
        const lines = code.split("\n");
        const logs: string[] = [];
        const vars: Record<string, any> = {};

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          // Handle print statements
          const printMatch = trimmed.match(/^print\((.+)\)$/);
          if (printMatch) {
            let expr = printMatch[1];
            // Handle f-strings simply
            expr = expr.replace(/f"([^"]*)"/, (_, content) => {
              return '"' + content.replace(/\{([^}]+)\}/g, (__, varName) => {
                return vars[varName.trim()] ?? varName;
              }) + '"';
            });
            try {
              const result = eval(expr);
              logs.push(String(result));
            } catch {
              logs.push(expr.replace(/^["']|["']$/g, ""));
            }
            continue;
          }

          // Handle variable assignments
          const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
          if (assignMatch) {
            try {
              vars[assignMatch[1]] = eval(assignMatch[2]);
            } catch {
              vars[assignMatch[1]] = assignMatch[2].replace(/^["']|["']$/g, "");
            }
          }
        }
        setOutput(logs.join("\n") || "✅ Python simulation complete (limited interpreter — full Python requires server runtime)");
      } catch (err: any) {
        setOutput("❌ Error: " + err.message);
      }
      setIsRunning(false);
    }
  }, [code, selectedLang]);

  const getAIHint = useCallback(async () => {
    setAiLoading(true);
    setAiHint("");
    try {
      // Use the LLM via the existing lesson content generation endpoint
      const result = await reviewCode.mutateAsync({
        lessonId: 0, // Not saving, just using LLM
        subjectName: `${selectedLang} Programming`,
        topicDescription: `Review this ${selectedLang} code and provide helpful hints, suggestions for improvement, and explain any errors. Keep the response encouraging and educational for a K-12 student.\n\nCode:\n${code}`,
      });
      setAiHint(result.content || "Great job! Keep experimenting with your code.");
    } catch {
      setAiHint("💡 **Tip:** Check your syntax carefully. Make sure all brackets, parentheses, and quotes are properly closed. Try running your code step by step to find any issues!");
    }
    setAiLoading(false);
  }, [code, selectedLang, reviewCode]);

  const loadTemplate = (template: { code: string; title: string }) => {
    setCode(template.code);
    setOutput("");
    toast.success(`Loaded: ${template.title}`);
  };

  const loadChallenge = (challenge: typeof AI_CHALLENGES[0]) => {
    setSelectedChallenge(challenge);
    setCode(challenge.starterCode);
    setSelectedLang("javascript");
    setOutput("");
    setActiveTab("editor");
    toast.success(`Challenge loaded: ${challenge.title}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="w-7 h-7 text-blue-500" />
            Coding & AI Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Learn to code, build AI projects, and create technology — all in your browser
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Terminal className="w-3 h-3 mr-1" />
          Interactive Sandbox
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor" className="gap-1"><Code2 className="w-4 h-4" /> Code Editor</TabsTrigger>
          <TabsTrigger value="ai-builder" className="gap-1"><Bot className="w-4 h-4" /> AI Builder</TabsTrigger>
          <TabsTrigger value="lessons" className="gap-1"><BookOpen className="w-4 h-4" /> Guided Lessons</TabsTrigger>
        </TabsList>

        {/* Code Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          {/* Language Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            {LANGUAGES.map(lang => {
              const Icon = lang.icon;
              return (
                <Button
                  key={lang.id}
                  variant={selectedLang === lang.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLang(lang.id);
                    const templates = TEMPLATES[lang.id];
                    if (templates?.[0]) setCode(templates[0].code);
                    setOutput("");
                  }}
                  className="gap-2"
                >
                  <Icon className={`w-4 h-4 ${selectedLang === lang.id ? "" : lang.color}`} />
                  {lang.name}
                </Button>
              );
            })}

            <div className="ml-auto flex gap-2">
              <Select
                value="template"
                onValueChange={(val) => {
                  const templates = TEMPLATES[selectedLang] || [];
                  const t = templates.find(t => t.title === val);
                  if (t) loadTemplate(t);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Load Template..." />
                </SelectTrigger>
                <SelectContent>
                  {(TEMPLATES[selectedLang] || []).map(t => (
                    <SelectItem key={t.title} value={t.title}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Editor + Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Code Editor</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setCode(""); setOutput(""); }}>
                    <RotateCcw className="w-3 h-3 mr-1" /> Clear
                  </Button>
                  <Button size="sm" onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-3 h-3 mr-1" /> Run
                  </Button>
                </div>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[400px] bg-gray-950 text-green-400 border-gray-700 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Output / Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedLang === "html" || selectedLang === "css" ? "Preview" : "Output"}
                </p>
                <Button size="sm" variant="outline" onClick={getAIHint} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Lightbulb className="w-3 h-3 mr-1" />}
                  AI Hint
                </Button>
              </div>

              {selectedLang === "html" || selectedLang === "css" ? (
                <iframe
                  ref={iframeRef}
                  className="w-full min-h-[400px] bg-white border rounded-md"
                  sandbox="allow-scripts"
                  title="Code Preview"
                />
              ) : (
                <div className="font-mono text-sm min-h-[400px] bg-gray-950 text-gray-300 border border-gray-700 rounded-md p-4 overflow-auto whitespace-pre-wrap">
                  {output || <span className="text-gray-600">Click "Run" to see output...</span>}
                </div>
              )}
            </div>
          </div>

          {/* AI Hint Panel */}
          {aiHint && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  AI Code Review
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <Streamdown>{aiHint}</Streamdown>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Builder Tab */}
        <TabsContent value="ai-builder" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_CHALLENGES.map(challenge => (
              <Card
                key={challenge.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedChallenge?.id === challenge.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => loadChallenge(challenge)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      challenge.difficulty === "Beginner" ? "default" :
                      challenge.difficulty === "Intermediate" ? "secondary" : "destructive"
                    }>
                      {challenge.difficulty}
                    </Badge>
                    <Cpu className="w-5 h-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {challenge.concepts.map(c => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                  <Button size="sm" className="w-full mt-3 gap-1">
                    <Play className="w-3 h-3" /> Start Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Concepts Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                How AI Works — Concept Map
              </CardTitle>
              <CardDescription>
                Understanding the building blocks of artificial intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Data Collection", icon: "📊", desc: "AI needs data to learn from — text, images, numbers, or patterns", step: 1 },
                  { title: "Pattern Recognition", icon: "🔍", desc: "The AI finds patterns and relationships in the data", step: 2 },
                  { title: "Model Training", icon: "🧠", desc: "The AI practices making predictions and improves over time", step: 3 },
                  { title: "Prediction", icon: "⚡", desc: "The trained AI can now make decisions on new, unseen data", step: 4 },
                ].map(item => (
                  <div key={item.step} className="text-center p-4 rounded-lg bg-secondary/30">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Badge variant="outline" className="text-xs">Step {item.step}</Badge>
                    </div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    {item.step < 4 && (
                      <ChevronRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guided Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Web Development Basics",
                lessons: ["HTML Structure", "CSS Styling", "JavaScript Interactivity", "Responsive Design"],
                icon: Globe,
                color: "text-orange-500",
                level: "Beginner",
              },
              {
                title: "Python Programming",
                lessons: ["Variables & Types", "Loops & Conditions", "Functions", "Data Structures"],
                icon: FileCode,
                color: "text-blue-500",
                level: "Beginner",
              },
              {
                title: "AI & Machine Learning",
                lessons: ["What is AI?", "Data & Patterns", "Building a Classifier", "Neural Network Concepts"],
                icon: Bot,
                color: "text-purple-500",
                level: "Intermediate",
              },
              {
                title: "Blockchain & Crypto",
                lessons: ["What is Blockchain?", "How Bitcoin Works", "Smart Contracts", "NFT Creation Basics"],
                icon: Zap,
                color: "text-cyan-500",
                level: "Intermediate",
              },
            ].map(course => {
              const Icon = course.icon;
              return (
                <Card key={course.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`w-6 h-6 ${course.color}`} />
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.lessons.map((lesson, i) => (
                        <div key={lesson} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </div>
                          <span>{lesson}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => {
                        toast.info("Guided lesson content is generated by AI when you start. Navigate to K-12 Curriculum to begin!");
                      }}
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
