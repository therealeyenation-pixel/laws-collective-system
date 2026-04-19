import{b as useAuth,t as trpc,j as jsxDevRuntimeExports,d as Badge,B as Button}from"./index-YasavcTA.js";import{a4 as reactExports}from"./vendor-charts-aHHJ_5FL.js";import{C as Card,b as CardHeader,c as CardTitle,a as CardContent,d as CardDescription}from"./card-CixmRFPa.js";import{T as Tabs,a as TabsList,b as TabsTrigger,c as TabsContent}from"./tabs-_9mpvSQR.js";import{S as Select,a as SelectTrigger,b as SelectValue,c as SelectContent,d as SelectItem}from"./select-CJpW7QY-.js";import{T as Textarea}from"./textarea-Cg8cZyox.js";import{t as toast}from"./vendor-react-B_RGRDu7.js";import{L as LazyStreamdown}from"./LazyStreamdown-BdpOij2B.js";import{bd as CodeXml,ev as Terminal,bi as Bot,B as BookOpen,b0 as Globe,ew as Braces,bR as FileCode,aI as Palette,R as RotateCcw,a as Play,m as LoaderCircle,c5 as Lightbulb,l as Sparkles,ce as Cpu,aO as Layers,q as ChevronRight,Z as Zap}from"./vendor-icons-NeKP93ct.js";import"./vendor-trpc-wnUC-qIV.js";import"./vendor-radix-CVGGCPXs.js";import"./vendor-diagrams-Dz2nWOB_.js";import"./dialog-CVR0ksSO.js";import"./useComposition-C0TKgE2j.js";const LANGUAGES=[{id:"html",name:"HTML/CSS",icon:Globe,color:"text-orange-500",description:"Web page structure & styling"},{id:"javascript",name:"JavaScript",icon:Braces,color:"text-yellow-500",description:"Web interactivity & logic"},{id:"python",name:"Python",icon:FileCode,color:"text-blue-500",description:"General programming & data science"},{id:"css",name:"CSS Art",icon:Palette,color:"text-pink-500",description:"Creative visual design with code"}],TEMPLATES={html:[{title:"My First Webpage",description:"Create a basic HTML page with headings and paragraphs",code:`<!DOCTYPE html>
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
</html>`},{title:"Interactive Form",description:"Build a form with inputs, buttons, and styling",code:`<!DOCTYPE html>
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
</html>`}],javascript:[{title:"Calculator",description:"Build a simple calculator with JavaScript",code:`// Simple Calculator
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
console.log("\\nCircle with radius 5:", circleArea(5).toFixed(2));`},{title:"Array Adventures",description:"Learn arrays, loops, and data manipulation",code:`// Array Adventures - Learn to work with data!

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

// Challenge: Add a new student and find who has the highest grade!`}],python:[{title:"Python Basics",description:"Variables, loops, and functions in Python",code:`# Python Basics - Your First Program!
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
# Formula: C = (F - 32) × 5/9`},{title:"Data Science Intro",description:"Work with data like a real data scientist",code:`# Data Science Introduction
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

# Challenge: Find which season has the most rainfall`}],css:[{title:"CSS Sunset",description:"Create a beautiful sunset scene with pure CSS",code:`<!DOCTYPE html>
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
</html>`}]},AI_CHALLENGES=[{id:"chatbot",title:"Build a Chatbot",difficulty:"Beginner",description:"Create a simple rule-based chatbot that responds to user input",concepts:["Conditional Logic","String Matching","User Input"],starterCode:`// Simple Chatbot Builder
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

// Challenge: Add responses for "math", "time", and "goodbye"!`},{id:"recommendation",title:"Recommendation Engine",difficulty:"Intermediate",description:"Build a system that recommends items based on user preferences",concepts:["Data Structures","Scoring Algorithms","Filtering"],starterCode:`// Recommendation Engine
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

// Challenge: Add a "mood" factor and more books!`},{id:"image-classifier",title:"Image Classifier Concept",difficulty:"Advanced",description:"Understand how AI classifies images using feature detection",concepts:["Feature Extraction","Pattern Matching","Classification"],starterCode:`// AI Image Classifier Concept
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

// Challenge: Add a "diamond" pattern and update the classifier!`}];function AcademyCodingSimulator(){useAuth();const[selectedLang,setSelectedLang]=reactExports.useState("html"),[code,setCode]=reactExports.useState(TEMPLATES.html[0].code),[output,setOutput]=reactExports.useState(""),[isRunning,setIsRunning]=reactExports.useState(!1),[activeTab,setActiveTab]=reactExports.useState("editor"),[aiHint,setAiHint]=reactExports.useState(""),[aiLoading,setAiLoading]=reactExports.useState(!1),[selectedChallenge,setSelectedChallenge]=reactExports.useState(null),iframeRef=reactExports.useRef(null),reviewCode=trpc.academyK12.generateLessonContent.useMutation(),runCode=reactExports.useCallback(()=>{if(setIsRunning(!0),setOutput(""),selectedLang==="html"||selectedLang==="css"){if(iframeRef.current){const e=iframeRef.current.contentDocument;e&&(e.open(),e.write(code),e.close())}setOutput("✅ Rendered in preview panel"),setIsRunning(!1)}else if(selectedLang==="javascript"){try{const e=[],a={log:(...t)=>e.push(t.map(s=>typeof s=="object"?JSON.stringify(s,null,2):String(s)).join(" ")),error:(...t)=>e.push("❌ "+t.join(" ")),warn:(...t)=>e.push("⚠️ "+t.join(" "))};new Function("console",code)(a),setOutput(e.join(`
`)||"✅ Code executed (no output)")}catch(e){setOutput("❌ Error: "+e.message)}setIsRunning(!1)}else if(selectedLang==="python"){try{const lines=code.split(`
`),logs=[],vars={};for(const line of lines){const trimmed=line.trim();if(!trimmed||trimmed.startsWith("#"))continue;const printMatch=trimmed.match(/^print\((.+)\)$/);if(printMatch){let expr=printMatch[1];expr=expr.replace(/f"([^"]*)"/,(e,a)=>'"'+a.replace(/\{([^}]+)\}/g,(i,t)=>vars[t.trim()]??t)+'"');try{const result=eval(expr);logs.push(String(result))}catch{logs.push(expr.replace(/^["']|["']$/g,""))}continue}const assignMatch=trimmed.match(/^(\w+)\s*=\s*(.+)$/);if(assignMatch)try{vars[assignMatch[1]]=eval(assignMatch[2])}catch{vars[assignMatch[1]]=assignMatch[2].replace(/^["']|["']$/g,"")}}setOutput(logs.join(`
`)||"✅ Python simulation complete (limited interpreter — full Python requires server runtime)")}catch(e){setOutput("❌ Error: "+e.message)}setIsRunning(!1)}},[code,selectedLang]),getAIHint=reactExports.useCallback(async()=>{setAiLoading(!0),setAiHint("");try{const e=await reviewCode.mutateAsync({lessonId:0,subjectName:`${selectedLang} Programming`,topicDescription:`Review this ${selectedLang} code and provide helpful hints, suggestions for improvement, and explain any errors. Keep the response encouraging and educational for a K-12 student.

Code:
${code}`});setAiHint(e.content||"Great job! Keep experimenting with your code.")}catch{setAiHint("💡 **Tip:** Check your syntax carefully. Make sure all brackets, parentheses, and quotes are properly closed. Try running your code step by step to find any issues!")}setAiLoading(!1)},[code,selectedLang,reviewCode]),loadTemplate=e=>{setCode(e.code),setOutput(""),toast.success(`Loaded: ${e.title}`)},loadChallenge=e=>{setSelectedChallenge(e),setCode(e.starterCode),setSelectedLang("javascript"),setOutput(""),setActiveTab("editor"),toast.success(`Challenge loaded: ${e.title}`)};return jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:562",className:"space-y-6",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:564",className:"flex items-center justify-between",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:565",children:[jsxDevRuntimeExports.jsxDEV("h1",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:566",className:"text-2xl font-bold text-foreground flex items-center gap-2",children:[jsxDevRuntimeExports.jsxDEV(CodeXml,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:567",className:"w-7 h-7 text-blue-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:567,columnNumber:13},this),"Coding & AI Simulator"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:566,columnNumber:11},this),jsxDevRuntimeExports.jsxDEV("p",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:570",className:"text-muted-foreground mt-1",children:"Learn to code, build AI projects, and create technology — all in your browser"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:570,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:565,columnNumber:9},this),jsxDevRuntimeExports.jsxDEV(Badge,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:574",variant:"outline",className:"text-sm",children:[jsxDevRuntimeExports.jsxDEV(Terminal,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:575",className:"w-3 h-3 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:575,columnNumber:11},this),"Interactive Sandbox"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:574,columnNumber:9},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:564,columnNumber:7},this),jsxDevRuntimeExports.jsxDEV(Tabs,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:580",value:activeTab,onValueChange:setActiveTab,children:[jsxDevRuntimeExports.jsxDEV(TabsList,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:581",children:[jsxDevRuntimeExports.jsxDEV(TabsTrigger,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:582",value:"editor",className:"gap-1",children:[jsxDevRuntimeExports.jsxDEV(CodeXml,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:582",className:"w-4 h-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:582,columnNumber:116},this)," Code Editor"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:582,columnNumber:11},this),jsxDevRuntimeExports.jsxDEV(TabsTrigger,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:583",value:"ai-builder",className:"gap-1",children:[jsxDevRuntimeExports.jsxDEV(Bot,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:583",className:"w-4 h-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:583,columnNumber:120},this)," AI Builder"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:583,columnNumber:11},this),jsxDevRuntimeExports.jsxDEV(TabsTrigger,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:584",value:"lessons",className:"gap-1",children:[jsxDevRuntimeExports.jsxDEV(BookOpen,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:584",className:"w-4 h-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:584,columnNumber:117},this)," Guided Lessons"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:584,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:581,columnNumber:9},this),jsxDevRuntimeExports.jsxDEV(TabsContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:588",value:"editor",className:"space-y-4",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:590",className:"flex items-center gap-3 flex-wrap",children:[LANGUAGES.map(e=>{const a=e.icon;return jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:594",variant:selectedLang===e.id?"default":"outline",size:"sm",onClick:()=>{setSelectedLang(e.id);const i=TEMPLATES[e.id];i?.[0]&&setCode(i[0].code),setOutput("")},className:"gap-2",children:[jsxDevRuntimeExports.jsxDEV(a,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:606",className:`w-4 h-4 ${selectedLang===e.id?"":e.color}`},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:606,columnNumber:19},this),e.name]},e.id,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:594,columnNumber:17},this)}),jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:612",className:"ml-auto flex gap-2",children:jsxDevRuntimeExports.jsxDEV(Select,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:613",value:"template",onValueChange:e=>{const i=(TEMPLATES[selectedLang]||[]).find(t=>t.title===e);i&&loadTemplate(i)},children:[jsxDevRuntimeExports.jsxDEV(SelectTrigger,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:621",className:"w-[200px]",children:jsxDevRuntimeExports.jsxDEV(SelectValue,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:622",placeholder:"Load Template..."},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:622,columnNumber:19},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:621,columnNumber:17},this),jsxDevRuntimeExports.jsxDEV(SelectContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:624",children:(TEMPLATES[selectedLang]||[]).map(e=>jsxDevRuntimeExports.jsxDEV(SelectItem,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:626",value:e.title,children:e.title},e.title,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:626,columnNumber:21},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:624,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:613,columnNumber:15},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:612,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:590,columnNumber:11},this),jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:634",className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:636",className:"space-y-2",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:637",className:"flex items-center justify-between",children:[jsxDevRuntimeExports.jsxDEV("p",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:638",className:"text-sm font-medium text-muted-foreground",children:"Code Editor"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:638,columnNumber:17},this),jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:639",className:"flex gap-2",children:[jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:640",size:"sm",variant:"outline",onClick:()=>{setCode(""),setOutput("")},children:[jsxDevRuntimeExports.jsxDEV(RotateCcw,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:641",className:"w-3 h-3 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:641,columnNumber:21},this)," Clear"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:640,columnNumber:19},this),jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:643",size:"sm",onClick:runCode,disabled:isRunning,className:"bg-green-600 hover:bg-green-700",children:[jsxDevRuntimeExports.jsxDEV(Play,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:644",className:"w-3 h-3 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:644,columnNumber:21},this)," Run"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:643,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:639,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:637,columnNumber:15},this),jsxDevRuntimeExports.jsxDEV(Textarea,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:648",value:code,onChange:e=>setCode(e.target.value),className:"font-mono text-sm min-h-[400px] bg-gray-950 text-green-400 border-gray-700 resize-none",spellCheck:!1},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:648,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:636,columnNumber:13},this),jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:657",className:"space-y-2",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:658",className:"flex items-center justify-between",children:[jsxDevRuntimeExports.jsxDEV("p",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:659",className:"text-sm font-medium text-muted-foreground",children:selectedLang==="html"||selectedLang==="css"?"Preview":"Output"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:659,columnNumber:17},this),jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:662",size:"sm",variant:"outline",onClick:getAIHint,disabled:aiLoading,children:[aiLoading?jsxDevRuntimeExports.jsxDEV(LoaderCircle,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:663",className:"w-3 h-3 mr-1 animate-spin"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:663,columnNumber:32},this):jsxDevRuntimeExports.jsxDEV(Lightbulb,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:663",className:"w-3 h-3 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:663,columnNumber:143},this),"AI Hint"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:662,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:658,columnNumber:15},this),selectedLang==="html"||selectedLang==="css"?jsxDevRuntimeExports.jsxDEV("iframe",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:669",ref:iframeRef,className:"w-full min-h-[400px] bg-white border rounded-md",sandbox:"allow-scripts",title:"Code Preview"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:669,columnNumber:17},this):jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:676",className:"font-mono text-sm min-h-[400px] bg-gray-950 text-gray-300 border border-gray-700 rounded-md p-4 overflow-auto whitespace-pre-wrap",children:output||jsxDevRuntimeExports.jsxDEV("span",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:677",className:"text-gray-600",children:'Click "Run" to see output...'},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:677,columnNumber:30},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:676,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:657,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:634,columnNumber:11},this),aiHint&&jsxDevRuntimeExports.jsxDEV(Card,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:685",className:"border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",children:[jsxDevRuntimeExports.jsxDEV(CardHeader,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:686",className:"pb-2",children:jsxDevRuntimeExports.jsxDEV(CardTitle,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:687",className:"text-sm flex items-center gap-2",children:[jsxDevRuntimeExports.jsxDEV(Sparkles,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:688",className:"w-4 h-4 text-blue-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:688,columnNumber:19},this),"AI Code Review"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:687,columnNumber:17},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:686,columnNumber:15},this),jsxDevRuntimeExports.jsxDEV(CardContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:692",className:"text-sm",children:jsxDevRuntimeExports.jsxDEV(LazyStreamdown,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:693",children:aiHint},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:693,columnNumber:17},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:692,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:685,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:588,columnNumber:9},this),jsxDevRuntimeExports.jsxDEV(TabsContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:700",value:"ai-builder",className:"space-y-4",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:701",className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:AI_CHALLENGES.map(e=>jsxDevRuntimeExports.jsxDEV(Card,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:703",className:`cursor-pointer hover:shadow-md transition-shadow ${selectedChallenge?.id===e.id?"ring-2 ring-blue-500":""}`,onClick:()=>loadChallenge(e),children:[jsxDevRuntimeExports.jsxDEV(CardHeader,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:710",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:711",className:"flex items-center justify-between",children:[jsxDevRuntimeExports.jsxDEV(Badge,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:712",variant:e.difficulty==="Beginner"?"default":e.difficulty==="Intermediate"?"secondary":"destructive",children:e.difficulty},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:712,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV(Cpu,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:718",className:"w-5 h-5 text-purple-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:718,columnNumber:21},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:711,columnNumber:19},this),jsxDevRuntimeExports.jsxDEV(CardTitle,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:720",className:"text-lg",children:e.title},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:720,columnNumber:19},this),jsxDevRuntimeExports.jsxDEV(CardDescription,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:721",children:e.description},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:721,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:710,columnNumber:17},this),jsxDevRuntimeExports.jsxDEV(CardContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:723",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:724",className:"flex flex-wrap gap-1",children:e.concepts.map(a=>jsxDevRuntimeExports.jsxDEV(Badge,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:726",variant:"outline",className:"text-xs",children:a},a,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:726,columnNumber:23},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:724,columnNumber:19},this),jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:729",size:"sm",className:"w-full mt-3 gap-1",children:[jsxDevRuntimeExports.jsxDEV(Play,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:730",className:"w-3 h-3"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:730,columnNumber:21},this)," Start Challenge"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:729,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:723,columnNumber:17},this)]},e.id,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:703,columnNumber:15},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:701,columnNumber:11},this),jsxDevRuntimeExports.jsxDEV(Card,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:738",children:[jsxDevRuntimeExports.jsxDEV(CardHeader,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:739",children:[jsxDevRuntimeExports.jsxDEV(CardTitle,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:740",className:"flex items-center gap-2",children:[jsxDevRuntimeExports.jsxDEV(Layers,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:741",className:"w-5 h-5 text-purple-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:741,columnNumber:17},this),"How AI Works — Concept Map"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:740,columnNumber:15},this),jsxDevRuntimeExports.jsxDEV(CardDescription,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:744",children:"Understanding the building blocks of artificial intelligence"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:744,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:739,columnNumber:13},this),jsxDevRuntimeExports.jsxDEV(CardContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:748",children:jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:749",className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[{title:"Data Collection",icon:"📊",desc:"AI needs data to learn from — text, images, numbers, or patterns",step:1},{title:"Pattern Recognition",icon:"🔍",desc:"The AI finds patterns and relationships in the data",step:2},{title:"Model Training",icon:"🧠",desc:"The AI practices making predictions and improves over time",step:3},{title:"Prediction",icon:"⚡",desc:"The trained AI can now make decisions on new, unseen data",step:4}].map(e=>jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:756",className:"text-center p-4 rounded-lg bg-secondary/30",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:757",className:"text-3xl mb-2",children:e.icon},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:757,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:758",className:"flex items-center justify-center gap-1 mb-1",children:jsxDevRuntimeExports.jsxDEV(Badge,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:759",variant:"outline",className:"text-xs",children:["Step ",e.step]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:759,columnNumber:23},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:758,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV("p",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:761",className:"font-semibold text-sm",children:e.title},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:761,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV("p",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:762",className:"text-xs text-muted-foreground mt-1",children:e.desc},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:762,columnNumber:21},this),e.step<4&&jsxDevRuntimeExports.jsxDEV(ChevronRight,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:764",className:"w-4 h-4 mx-auto mt-2 text-muted-foreground hidden md:block"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:764,columnNumber:23},this)]},e.step,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:756,columnNumber:19},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:749,columnNumber:15},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:748,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:738,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:700,columnNumber:9},this),jsxDevRuntimeExports.jsxDEV(TabsContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:774",value:"lessons",className:"space-y-4",children:jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:775",className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[{title:"Web Development Basics",lessons:["HTML Structure","CSS Styling","JavaScript Interactivity","Responsive Design"],icon:Globe,color:"text-orange-500",level:"Beginner"},{title:"Python Programming",lessons:["Variables & Types","Loops & Conditions","Functions","Data Structures"],icon:FileCode,color:"text-blue-500",level:"Beginner"},{title:"AI & Machine Learning",lessons:["What is AI?","Data & Patterns","Building a Classifier","Neural Network Concepts"],icon:Bot,color:"text-purple-500",level:"Intermediate"},{title:"Blockchain & Crypto",lessons:["What is Blockchain?","How Bitcoin Works","Smart Contracts","NFT Creation Basics"],icon:Zap,color:"text-cyan-500",level:"Intermediate"}].map(e=>{const a=e.icon;return jsxDevRuntimeExports.jsxDEV(Card,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:808",children:[jsxDevRuntimeExports.jsxDEV(CardHeader,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:809",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:810",className:"flex items-center justify-between",children:[jsxDevRuntimeExports.jsxDEV(a,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:811",className:`w-6 h-6 ${e.color}`},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:811,columnNumber:23},this),jsxDevRuntimeExports.jsxDEV(Badge,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:812",variant:"outline",children:e.level},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:812,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:810,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV(CardTitle,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:814",children:e.title},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:814,columnNumber:21},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:809,columnNumber:19},this),jsxDevRuntimeExports.jsxDEV(CardContent,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:816",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:817",className:"space-y-2",children:e.lessons.map((i,t)=>jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:819",className:"flex items-center gap-2 text-sm",children:[jsxDevRuntimeExports.jsxDEV("div",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:820",className:"w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium",children:t+1},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:820,columnNumber:27},this),jsxDevRuntimeExports.jsxDEV("span",{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:823",children:i},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:823,columnNumber:27},this)]},i,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:819,columnNumber:25},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:817,columnNumber:21},this),jsxDevRuntimeExports.jsxDEV(Button,{"data-loc":"client/src/pages/AcademyCodingSimulator.tsx:827",size:"sm",className:"w-full mt-4",onClick:()=>{toast.info("Guided lesson content is generated by AI when you start. Navigate to K-12 Curriculum to begin!")},children:"Start Learning"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:827,columnNumber:21},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:816,columnNumber:19},this)]},e.title,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:808,columnNumber:17},this)})},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:775,columnNumber:11},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:774,columnNumber:9},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:580,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/AcademyCodingSimulator.tsx",lineNumber:562,columnNumber:5},this)}export{AcademyCodingSimulator as default};
