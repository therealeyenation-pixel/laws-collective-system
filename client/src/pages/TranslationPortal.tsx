import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Languages,
  Users,
  Trophy,
  Star,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Clock,
  Award,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit2,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  translationContributionService,
  TranslationSuggestion,
  TranslationContributor,
  LanguageProgress,
  TranslationKey
} from "@/services/translationContributionService";
import { SupportedLanguage, i18nService } from "@/services/i18nService";

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇧🇷',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  hi: '🇮🇳'
};

const RANK_COLORS: Record<string, string> = {
  beginner: 'bg-gray-100 text-gray-700',
  contributor: 'bg-blue-100 text-blue-700',
  expert: 'bg-purple-100 text-purple-700',
  master: 'bg-yellow-100 text-yellow-700'
};

export default function TranslationPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contribute');
  const [keys, setKeys] = useState<TranslationKey[]>([]);
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([]);
  const [contributors, setContributors] = useState<TranslationContributor[]>([]);
  const [languageProgress, setLanguageProgress] = useState<LanguageProgress[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('es');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNamespace, setFilterNamespace] = useState<string>('all');
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<TranslationKey | null>(null);
  const [translationText, setTranslationText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setKeys(translationContributionService.getTranslationKeys());
    setSuggestions(translationContributionService.getSuggestions());
    setContributors(translationContributionService.getContributors());
    setLanguageProgress(translationContributionService.getLanguageProgress());
  };

  const stats = translationContributionService.getStats();
  const leaderboard = translationContributionService.getLeaderboard(10);

  const filteredKeys = keys.filter(key => {
    const matchesSearch = !searchQuery || 
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.sourceText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNamespace = filterNamespace === 'all' || key.namespace === filterNamespace;
    return matchesSearch && matchesNamespace;
  });

  const namespaces = [...new Set(keys.map(k => k.namespace))];

  const handleOpenContribute = (key: TranslationKey) => {
    setSelectedKey(key);
    setTranslationText(key.translations[selectedLanguage]?.text || '');
    setIsContributeOpen(true);
  };

  const handleSubmitTranslation = () => {
    if (!selectedKey || !translationText || !user) {
      toast.error("Please enter a translation");
      return;
    }

    translationContributionService.submitSuggestion(
      selectedKey.key,
      selectedKey.namespace,
      selectedKey.sourceText,
      translationText,
      selectedLanguage,
      user.id?.toString() || 'unknown',
      user.name || 'Anonymous'
    );

    toast.success("Translation submitted for review!");
    setIsContributeOpen(false);
    setTranslationText('');
    loadData();
  };

  const handleVote = (suggestionId: string, upvote: boolean) => {
    if (!user) return;
    translationContributionService.voteSuggestion(suggestionId, user.id?.toString() || '', upvote);
    loadData();
  };

  const handleReview = (suggestionId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    translationContributionService.reviewSuggestion(
      suggestionId,
      status,
      user.id?.toString() || ''
    );
    toast.success(`Translation ${status}`);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      missing: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      approved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> }
    };
    const variant = variants[status] || variants.missing;
    return (
      <Badge className={variant.color}>
        {variant.icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Translation Portal</h1>
            <p className="text-muted-foreground mt-1">
              Help translate the application into your language
            </p>
          </div>
          <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as SupportedLanguage)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {i18nService.getSupportedLanguages().filter(l => l.code !== 'en').map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="mr-2">{LANGUAGE_FLAGS[lang.code]}</span>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Languages className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSuggestions}</p>
                  <p className="text-sm text-muted-foreground">Total Translations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingSuggestions}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalContributors}</p>
                  <p className="text-sm text-muted-foreground">Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageApprovalRate}%</p>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Translation Progress by Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {languageProgress.map(progress => (
                <div 
                  key={progress.language} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLanguage === progress.language ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedLanguage(progress.language)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{LANGUAGE_FLAGS[progress.language]}</span>
                      <span className="font-medium capitalize">
                        {i18nService.getSupportedLanguages().find(l => l.code === progress.language)?.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.approvedKeys} approved</span>
                    <span>{progress.pendingKeys} pending</span>
                    <span>{progress.totalKeys - progress.translatedKeys} missing</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contribute">
              <Edit2 className="w-4 h-4 mr-2" />
              Contribute
            </TabsTrigger>
            <TabsTrigger value="review">
              <Check className="w-4 h-4 mr-2" />
              Review ({stats.pendingSuggestions})
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Contribute Tab */}
          <TabsContent value="contribute" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterNamespace} onValueChange={setFilterNamespace}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All namespaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All namespaces</SelectItem>
                  {namespaces.map(ns => (
                    <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Translation Keys */}
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredKeys.map(key => {
                      const translation = key.translations[selectedLanguage];
                      return (
                        <div
                          key={`${key.namespace}.${key.key}`}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{key.namespace}</Badge>
                              <code className="text-xs bg-muted px-1 rounded">{key.key}</code>
                              {getStatusBadge(translation?.status || 'missing')}
                            </div>
                            <p className="font-medium">{key.sourceText}</p>
                            {key.description && (
                              <p className="text-xs text-muted-foreground">{key.description}</p>
                            )}
                            {translation?.text && translation.status !== 'missing' && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="mr-2">{LANGUAGE_FLAGS[selectedLanguage]}</span>
                                {translation.text}
                              </p>
                            )}
                          </div>
                          <Button
                            variant={translation?.status === 'missing' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleOpenContribute(key)}
                          >
                            {translation?.status === 'missing' ? (
                              <>
                                <Edit2 className="w-4 h-4 mr-1" />
                                Translate
                              </>
                            ) : (
                              <>
                                <Edit2 className="w-4 h-4 mr-1" />
                                Improve
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Translations</CardTitle>
                <CardDescription>
                  Review and approve community translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suggestions.filter(s => s.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">All Caught Up!</h3>
                    <p className="text-sm text-muted-foreground">
                      No pending translations to review
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {suggestions
                        .filter(s => s.status === 'pending')
                        .map(suggestion => (
                          <div
                            key={suggestion.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{LANGUAGE_FLAGS[suggestion.language]}</span>
                                  <Badge variant="outline">{suggestion.namespace}</Badge>
                                  <code className="text-xs bg-muted px-1 rounded">{suggestion.key}</code>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Source: {suggestion.sourceText}
                                </p>
                                <p className="font-medium mt-1">
                                  Translation: {suggestion.suggestedText}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleVote(suggestion.id, true)}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                  <span className="text-sm">{suggestion.votes}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleVote(suggestion.id, false)}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                              <div className="text-xs text-muted-foreground">
                                Submitted by {suggestion.contributorName} • {suggestion.createdAt.toLocaleDateString()}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleReview(suggestion.id, 'rejected')}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleReview(suggestion.id, 'approved')}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 3 */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {leaderboard.slice(0, 3).map((contributor, index) => (
                      <Card 
                        key={contributor.id}
                        className={`${index === 0 ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            index === 0 ? 'bg-yellow-200 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            'bg-orange-200 text-orange-700'
                          }`}>
                            <span className="text-2xl font-bold">#{index + 1}</span>
                          </div>
                          <h3 className="font-bold text-lg">{contributor.name}</h3>
                          <Badge className={RANK_COLORS[contributor.rank]}>
                            {contributor.rank}
                          </Badge>
                          <div className="mt-3 space-y-1 text-sm">
                            <p><span className="font-medium">{contributor.score}</span> points</p>
                            <p><span className="font-medium">{contributor.approvedCount}</span> approved</p>
                            <div className="flex justify-center gap-1 mt-2">
                              {contributor.languages.map(lang => (
                                <span key={lang}>{LANGUAGE_FLAGS[lang]}</span>
                              ))}
                            </div>
                          </div>
                          {contributor.badges.length > 0 && (
                            <div className="flex justify-center gap-1 mt-3">
                              {contributor.badges.slice(0, 3).map(badge => (
                                <Badge key={badge.id} variant="outline" className="text-xs">
                                  {badge.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Full Leaderboard */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>All Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {leaderboard.map((contributor, index) => (
                        <div
                          key={contributor.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{contributor.name}</p>
                                <Badge className={`${RANK_COLORS[contributor.rank]} text-xs`}>
                                  {contributor.rank}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{contributor.approvedCount} approved</span>
                                <span>•</span>
                                <span>{contributor.languages.map(l => LANGUAGE_FLAGS[l]).join(' ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{contributor.score}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Rising Star</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        10 approved translations
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Translation Expert</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        50 approved translations
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Translation Master</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        100 approved translations
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Polyglot</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contribute to 3+ languages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contribute Dialog */}
        <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Translation</DialogTitle>
              <DialogDescription>
                Translate "{selectedKey?.sourceText}" to {i18nService.getSupportedLanguages().find(l => l.code === selectedLanguage)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium">English (Source)</span>
                </div>
                <p className="font-medium">{selectedKey?.sourceText}</p>
                {selectedKey?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedKey.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="text-lg">{LANGUAGE_FLAGS[selectedLanguage]}</span>
                  Translation
                </Label>
                <Textarea
                  value={translationText}
                  onChange={(e) => setTranslationText(e.target.value)}
                  placeholder={`Enter ${i18nService.getSupportedLanguages().find(l => l.code === selectedLanguage)?.name} translation...`}
                  rows={3}
                />
              </div>

              {selectedKey?.context && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Context</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{selectedKey.context}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContributeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTranslation} disabled={!translationText}>
                <Send className="w-4 h-4 mr-2" />
                Submit Translation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
