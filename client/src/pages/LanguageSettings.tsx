import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe,
  Check,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { 
  i18nService,
  useTranslation,
  SupportedLanguage,
  LanguageInfo
} from "@/services/i18nService";

export default function LanguageSettingsPage() {
  const { t, currentLanguage, setLanguage, languages, formatDate, formatNumber, formatCurrency } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage);

  const handleLanguageChange = (code: SupportedLanguage) => {
    setSelectedLanguage(code);
    setLanguage(code);
    toast.success(`Language changed to ${languages.find(l => l.code === code)?.name}`);
  };

  const handleExportTranslations = (code: SupportedLanguage) => {
    const data = i18nService.exportTranslations(code);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translations_${code}.json`;
    link.click();
    toast.success('Translations exported');
  };

  // Sample data for preview
  const sampleDate = new Date();
  const sampleNumber = 1234567.89;
  const sampleCurrency = 9999.99;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              <Globe className="w-8 h-8 inline-block mr-3" />
              {t('common', 'settings')}: Language
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure language and localization preferences
            </p>
          </div>
        </div>

        {/* Current Language */}
        <Card>
          <CardHeader>
            <CardTitle>Current Language</CardTitle>
            <CardDescription>Your currently selected language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {languages.find(l => l.code === currentLanguage)?.flag}
              </div>
              <div>
                <p className="text-xl font-bold">
                  {languages.find(l => l.code === currentLanguage)?.name}
                </p>
                <p className="text-muted-foreground">
                  {languages.find(l => l.code === currentLanguage)?.nativeName}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {languages.find(l => l.code === currentLanguage)?.direction.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Language</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedLanguage} 
              onValueChange={(v) => handleLanguageChange(v as SupportedLanguage)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {languages.map((lang) => {
                const coverage = i18nService.getTranslationCoverage(lang.code);
                return (
                  <div
                    key={lang.code}
                    className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedLanguage === lang.code 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                    }`}
                  >
                    <RadioGroupItem value={lang.code} id={lang.code} className="sr-only" />
                    <Label htmlFor={lang.code} className="flex items-center gap-4 cursor-pointer flex-1">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lang.name}</p>
                          {selectedLanguage === lang.code && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Translation coverage</span>
                            <span>{coverage}%</span>
                          </div>
                          <Progress value={coverage} className="h-1" />
                        </div>
                      </div>
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportTranslations(lang.code);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Localization Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Localization Preview</CardTitle>
            <CardDescription>See how dates, numbers, and currency are formatted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Date Format</p>
                <p className="font-medium">{formatDate(sampleDate)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(sampleDate, { dateStyle: 'full' })}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Number Format</p>
                <p className="font-medium">{formatNumber(sampleNumber)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatNumber(sampleNumber, { notation: 'compact' })}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Currency Format</p>
                <p className="font-medium">{formatCurrency(sampleCurrency)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(sampleCurrency, 'EUR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Samples */}
        <Card>
          <CardHeader>
            <CardTitle>Translation Samples</CardTitle>
            <CardDescription>Common phrases in the selected language</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'save', ns: 'common' },
                  { key: 'cancel', ns: 'common' },
                  { key: 'delete', ns: 'common' },
                  { key: 'search', ns: 'common' },
                  { key: 'loading', ns: 'common' },
                  { key: 'settings', ns: 'common' },
                  { key: 'dashboard', ns: 'navigation' },
                  { key: 'tasks', ns: 'navigation' },
                  { key: 'documents', ns: 'navigation' },
                  { key: 'welcome', ns: 'dashboard' },
                  { key: 'login', ns: 'auth' },
                  { key: 'logout', ns: 'auth' },
                  { key: 'success', ns: 'notifications' },
                  { key: 'error', ns: 'notifications' },
                  { key: 'required', ns: 'forms' },
                ].map(({ key, ns }) => (
                  <div key={`${ns}.${key}`} className="p-3 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">{ns}.{key}</p>
                    <p className="font-medium">{t(ns as any, key)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RTL Support Info */}
        {languages.find(l => l.code === currentLanguage)?.direction === 'rtl' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Right-to-Left Language Selected
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The interface will be mirrored to support right-to-left reading direction.
                    Some elements may require additional adjustments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
