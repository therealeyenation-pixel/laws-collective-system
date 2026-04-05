import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Search, 
  Clock, 
  BookMarked, 
  MessageCircle, 
  Volume2,
  Star,
  Filter,
  Library,
  GraduationCap,
  Leaf,
  Wind,
  Droplets,
  Heart,
  Trophy,
  BookText,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const LAWS_PILLARS = {
  land: { icon: Leaf, color: "text-green-600", bg: "bg-green-100", label: "Land" },
  air: { icon: Wind, color: "text-blue-600", bg: "bg-blue-100", label: "Air" },
  water: { icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-100", label: "Water" },
  self: { icon: Heart, color: "text-rose-600", bg: "bg-rose-100", label: "Self" },
};

const READING_LEVELS = {
  k_2: { label: "K-2", description: "Ages 5-8" },
  "3_5": { label: "3-5", description: "Ages 8-11" },
  "6_8": { label: "6-8", description: "Ages 11-14" },
  "9_12": { label: "9-12", description: "Ages 14-18" },
  adult: { label: "Adult", description: "18+" },
};

export default function VirtualLibrary() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  // Fetch books
  const { data: books, isLoading: booksLoading } = trpc.virtualLibrary.getBooks.useQuery();
  
  // Fetch reading sessions for authenticated users
  const { data: sessions, isLoading: sessionsLoading } = trpc.virtualLibrary.getReadingSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Fetch reading stats
  const { data: stats } = trpc.virtualLibrary.getReadingStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Seed sample books mutation
  const seedBooks = trpc.virtualLibrary.seedSampleBooks.useMutation({
    onSuccess: () => {
      toast.success("Sample books added to library!");
    },
    onError: (error) => {
      toast.error("Failed to add sample books: " + error.message);
    },
  });

  // Filter books based on search and filters
  const filteredBooks = books?.filter((book) => {
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = !selectedPillar || book.lawsPillar === selectedPillar;
    const matchesLevel = !selectedLevel || book.readingLevel === selectedLevel;
    return matchesSearch && matchesPillar && matchesLevel;
  }) || [];

  // Get in-progress books
  const inProgressBooks = sessions?.filter((s) => s.session.status === "in_progress") || [];
  const completedBooks = sessions?.filter((s) => s.session.status === "completed") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Library className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Virtual Library</h1>
              <p className="text-amber-100">AI-Powered Reading Companion for L.A.W.S. Academy</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          {isAuthenticated && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.booksInProgress}</span>
                </div>
                <p className="text-sm text-amber-100">Reading Now</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.completedBooks}</span>
                </div>
                <p className="text-sm text-amber-100">Books Completed</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.totalReadingHours}h</span>
                </div>
                <p className="text-sm text-amber-100">Reading Time</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <BookText className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.vocabularyWordsLearned}</span>
                </div>
                <p className="text-sm text-amber-100">Words Learned</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Library
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2" disabled={!isAuthenticated}>
              <BookMarked className="w-4 h-4" />
              My Reading
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center gap-2" disabled={!isAuthenticated}>
              <GraduationCap className="w-4 h-4" />
              Vocabulary
            </TabsTrigger>
          </TabsList>

          {/* Browse Library Tab */}
          <TabsContent value="browse">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* L.A.W.S. Pillar Filter */}
              <div className="flex gap-2">
                {Object.entries(LAWS_PILLARS).map(([key, { icon: Icon, color, bg, label }]) => (
                  <Button
                    key={key}
                    variant={selectedPillar === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPillar(selectedPillar === key ? null : key)}
                    className={selectedPillar === key ? "" : `${color} hover:${bg}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reading Level Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Reading Level:
              </span>
              {Object.entries(READING_LEVELS).map(([key, { label }]) => (
                <Badge
                  key={key}
                  variant={selectedLevel === key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedLevel(selectedLevel === key ? null : key)}
                >
                  {label}
                </Badge>
              ))}
            </div>

            {/* Books Grid */}
            {booksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <Card className="p-12 text-center">
                <Library className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Books Found</h3>
                <p className="text-muted-foreground mb-6">
                  {books?.length === 0 
                    ? "The library is empty. Add some books to get started!"
                    : "No books match your search criteria. Try adjusting your filters."}
                </p>
                {isAuthenticated && books?.length === 0 && (
                  <Button onClick={() => seedBooks.mutate()} disabled={seedBooks.isPending}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Sample Books
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => {
                  const pillar = book.lawsPillar ? LAWS_PILLARS[book.lawsPillar as keyof typeof LAWS_PILLARS] : null;
                  const level = READING_LEVELS[book.readingLevel as keyof typeof READING_LEVELS];
                  
                  return (
                    <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      {/* Book Cover */}
                      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        {book.coverImageUrl ? (
                          <img 
                            src={book.coverImageUrl} 
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-amber-400" />
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {pillar && (
                            <Badge className={`${pillar.bg} ${pillar.color} border-0`}>
                              <pillar.icon className="w-3 h-3 mr-1" />
                              {pillar.label}
                            </Badge>
                          )}
                          {book.hasAudioVersion && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              <Volume2 className="w-3 h-3 mr-1" />
                              Audio
                            </Badge>
                          )}
                        </div>
                        
                        {book.isFeatured && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Badge variant="outline" className="text-xs">
                            {level?.label || book.readingLevel}
                          </Badge>
                          {book.pageCount && (
                            <span>{book.pageCount} pages</span>
                          )}
                          {book.estimatedReadingMinutes && (
                            <span>~{Math.round(book.estimatedReadingMinutes / 60)}h</span>
                          )}
                        </div>
                        
                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {book.description}
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          <Link href={`/library/book/${book.id}`} className="flex-1">
                            <Button className="w-full" size="sm">
                              <BookOpen className="w-4 h-4 mr-1" />
                              Read
                            </Button>
                          </Link>
                          {book.hasDiscussionGuide && (
                            <Link href={`/library/discuss/${book.id}`}>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* My Reading Tab */}
          <TabsContent value="reading">
            {!isAuthenticated ? (
              <Card className="p-12 text-center">
                <BookMarked className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign In to Track Your Reading</h3>
                <p className="text-muted-foreground mb-6">
                  Create an account to track your reading progress, save vocabulary, and have discussions with the AI Reading Companion.
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Currently Reading */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    Currently Reading
                  </h2>
                  {inProgressBooks.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        You're not reading any books right now. Browse the library to find your next read!
                      </p>
                      <Button className="mt-4" onClick={() => setActiveTab("browse")}>
                        Browse Library
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inProgressBooks.map(({ session, book }) => (
                        <Card key={session.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-20 h-28 bg-gradient-to-br from-amber-100 to-orange-100 rounded flex items-center justify-center flex-shrink-0">
                                {book.coverImageUrl ? (
                                  <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                                ) : (
                                  <BookOpen className="w-8 h-8 text-amber-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                                
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Page {session.currentPage} of {book.pageCount || "?"}</span>
                                    <span>{session.percentComplete}%</span>
                                  </div>
                                  <Progress value={parseFloat(session.percentComplete || "0")} className="h-2" />
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                  <Link href={`/library/book/${book.id}`} className="flex-1">
                                    <Button size="sm" className="w-full">Continue</Button>
                                  </Link>
                                  <Link href={`/library/discuss/${book.id}`}>
                                    <Button size="sm" variant="outline">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>

                {/* Completed Books */}
                {completedBooks.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Completed Books
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {completedBooks.map(({ session, book }) => (
                        <Card key={session.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium line-clamp-1">{book.title}</h4>
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <Trophy className="w-3 h-3" />
                                Completed
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary">
            <VocabularySection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function VocabularySection() {
  const { data: words, isLoading } = trpc.virtualLibrary.getVocabularyWords.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BookText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Vocabulary Words Yet</h3>
        <p className="text-muted-foreground">
          As you read, you can save new words to build your vocabulary. Click on any word while reading to add it to your list.
        </p>
      </Card>
    );
  }

  const masteryColors = {
    new: "bg-gray-100 text-gray-700",
    learning: "bg-blue-100 text-blue-700",
    familiar: "bg-yellow-100 text-yellow-700",
    mastered: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Vocabulary</h2>
        <div className="flex gap-2">
          {Object.entries(masteryColors).map(([level, color]) => (
            <Badge key={level} className={color}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => (
          <Card key={word.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold">{word.word}</h3>
              <Badge className={masteryColors[word.masteryLevel as keyof typeof masteryColors] || masteryColors.new}>
                {word.masteryLevel}
              </Badge>
            </div>
            {word.partOfSpeech && (
              <p className="text-xs text-muted-foreground italic mb-1">{word.partOfSpeech}</p>
            )}
            <p className="text-sm mb-2">{word.definition}</p>
            {word.exampleSentence && (
              <p className="text-sm text-muted-foreground italic">"{word.exampleSentence}"</p>
            )}
            {word.contextFromBook && (
              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                From book: "{word.contextFromBook}"
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
