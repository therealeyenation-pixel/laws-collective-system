import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Volume2,
  VolumeX,
  Settings,
  BookMarked,
  Bookmark,
  Send,
  Loader2,
  Sun,
  Moon,
  Type,
  Sparkles,
  GraduationCap,
  Brain,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const DISCUSSION_TYPES = {
  comprehension: { icon: HelpCircle, label: "Comprehension", description: "Basic understanding questions" },
  analysis: { icon: Brain, label: "Literary Analysis", description: "Themes, symbolism, character development" },
  socratic: { icon: Lightbulb, label: "Socratic Dialogue", description: "Thought-provoking questions" },
  vocabulary: { icon: GraduationCap, label: "Vocabulary", description: "Learn new words" },
  free_form: { icon: MessageCircle, label: "Free Discussion", description: "Talk about anything" },
};

const GRADE_LEVELS = {
  k_2: "K-2 (Ages 5-8)",
  "3_5": "3-5 (Ages 8-11)",
  "6_8": "6-8 (Ages 11-14)",
  "9_12": "9-12 (Ages 14-18)",
};

export default function BookReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);
  
  // AI Companion state
  const [companionOpen, setCompanionOpen] = useState(false);
  const [discussionType, setDiscussionType] = useState<string>("free_form");
  const [gradeLevel, setGradeLevel] = useState<string>("6_8");
  const [userMessage, setUserMessage] = useState("");
  const [discussionId, setDiscussionId] = useState<number | undefined>();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch book details
  const { data: book, isLoading: bookLoading } = trpc.virtualLibrary.getBook.useQuery(
    { bookId: parseInt(bookId || "0") },
    { enabled: !!bookId }
  );

  // Start reading session
  const startReading = trpc.virtualLibrary.startReading.useMutation({
    onSuccess: (session) => {
      if (session.currentPage) {
        setCurrentPage(session.currentPage);
      }
    },
  });

  // Update progress
  const updateProgress = trpc.virtualLibrary.updateProgress.useMutation();

  // AI Discussion
  const discussWithAI = trpc.virtualLibrary.discussWithAI.useMutation({
    onSuccess: (result) => {
      setDiscussionId(result.discussionId);
      setMessages(result.messages);
      setUserMessage("");
    },
    onError: (error) => {
      toast.error("Failed to get response: " + error.message);
    },
  });

  // Add vocabulary word
  const addVocabulary = trpc.virtualLibrary.addVocabularyWord.useMutation({
    onSuccess: (result) => {
      toast.success(`Added "${result.word}" to your vocabulary!`);
    },
  });

  // Start reading session when component mounts
  useEffect(() => {
    if (isAuthenticated && bookId) {
      startReading.mutate({ bookId: parseInt(bookId) });
    }
  }, [isAuthenticated, bookId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save progress periodically
  useEffect(() => {
    const saveProgress = () => {
      if (isAuthenticated && startReading.data?.id) {
        updateProgress.mutate({
          sessionId: startReading.data.id,
          currentPage,
          readingMinutes: 1,
        });
      }
    };

    const interval = setInterval(saveProgress, 60000); // Save every minute
    return () => clearInterval(interval);
  }, [currentPage, isAuthenticated, startReading.data?.id]);

  const handleSendMessage = () => {
    if (!userMessage.trim() || !bookId) return;

    discussWithAI.mutate({
      bookId: parseInt(bookId),
      discussionId,
      message: userMessage,
      pageNumber: currentPage,
      discussionType: discussionType as any,
      gradeLevel: gradeLevel as any,
    });
  };

  const handleAddWord = (word: string) => {
    if (!bookId) return;
    addVocabulary.mutate({
      word,
      bookId: parseInt(bookId),
      contextFromBook: `Page ${currentPage}`,
    });
  };

  const themeStyles = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-gray-100",
    sepia: "bg-amber-50 text-amber-900",
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist.</p>
          <Link href="/library">
            <Button>Back to Library</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalPages = book.pageCount || 100;
  const progress = (currentPage / totalPages) * 100;

  return (
    <div className={`min-h-screen ${themeStyles[theme]}`}>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Library
                </Button>
              </Link>
              <div className="hidden md:block">
                <h1 className="font-semibold line-clamp-1">{book.title}</h1>
                <p className="text-xs text-muted-foreground">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Read Aloud Toggle */}
              <Button
                variant={readAloudEnabled ? "default" : "ghost"}
                size="sm"
                onClick={() => setReadAloudEnabled(!readAloudEnabled)}
              >
                {readAloudEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              {/* Settings */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Reading Settings</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Font Size */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        <Type className="w-4 h-4 inline mr-2" />
                        Font Size: {fontSize}px
                      </label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={([value]) => setFontSize(value)}
                        min={12}
                        max={24}
                        step={1}
                      />
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <div className="flex gap-2">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="w-4 h-4 mr-1" />
                          Light
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="w-4 h-4 mr-1" />
                          Dark
                        </Button>
                        <Button
                          variant={theme === "sepia" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("sepia")}
                          className="bg-amber-100 text-amber-900 hover:bg-amber-200"
                        >
                          Sepia
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* AI Companion Toggle */}
              <Button
                variant={companionOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setCompanionOpen(!companionOpen)}
                className="gap-1"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">AI Companion</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Page {currentPage} of {totalPages}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Book Content */}
        <main className={`flex-1 transition-all ${companionOpen ? "mr-96" : ""}`}>
          <div className="container max-w-3xl mx-auto px-4 py-8">
            {/* Book Content Placeholder */}
            <article 
              className="prose prose-lg max-w-none"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className="min-h-[60vh] p-8 bg-card rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Chapter {Math.ceil(currentPage / 10)}</h2>
                <p className="mb-4">
                  This is a placeholder for the book content. In a full implementation, this would display 
                  the actual text content of "{book.title}" by {book.author}.
                </p>
                <p className="mb-4">
                  The Virtual Library supports various content formats including PDF, EPUB, HTML, and plain text.
                  Each page would be rendered here with proper formatting and typography.
                </p>
                <p className="mb-4">
                  <strong>Current Page:</strong> {currentPage}<br />
                  <strong>Reading Level:</strong> {book.readingLevel}<br />
                  <strong>Genre:</strong> {book.genre}
                </p>
                <p className="text-muted-foreground italic">
                  Tip: Click the "AI Companion" button to discuss this book with your AI reading partner!
                </p>
              </div>
            </article>

            {/* Page Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-20 text-center"
                  min={1}
                  max={totalPages}
                />
                <span className="text-muted-foreground">/ {totalPages}</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </main>

        {/* AI Companion Sidebar */}
        {companionOpen && (
          <aside className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-lg z-40 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI Reading Companion
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setCompanionOpen(false)}>
                  ×
                </Button>
              </div>

              {/* Discussion Type Selector */}
              <div className="space-y-3">
                <Select value={discussionType} onValueChange={setDiscussionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Discussion Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISCUSSION_TYPES).map(([key, { icon: Icon, label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRADE_LEVELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Start a conversation about the book!</p>
                  <p className="text-sm">
                    Ask questions, discuss themes, or explore vocabulary.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {discussWithAI.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask about the book..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || discussWithAI.isPending}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently on page {currentPage} • Press Enter to send
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
