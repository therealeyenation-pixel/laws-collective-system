/**
 * Realm Assessment Component
 * Handles the quiz/assessment for each L.A.W.S. realm
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { OnboardingQuestion, OnboardingRealm, REALM_INFO, PASSING_SCORE } from '@/lib/onboarding/types';
import { getAssessmentQuestions } from '@/lib/onboarding/questions';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, BookOpen } from 'lucide-react';

interface RealmAssessmentProps {
  realm: OnboardingRealm;
  onComplete: (passed: boolean, score: number, responses: QuestionResponse[]) => void;
  onBack?: () => void;
}

interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export function RealmAssessment({ realm, onComplete, onBack }: RealmAssessmentProps) {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  const realmInfo = REALM_INFO[realm];

  useEffect(() => {
    // Get 5 random questions for this realm
    const assessmentQuestions = getAssessmentQuestions(realm, 5);
    setQuestions(assessmentQuestions);
  }, [realm]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelectOption = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedOption,
      isCorrect
    };

    setResponses([...responses, response]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Assessment complete
      setAssessmentComplete(true);
    }
  };

  const calculateScore = () => {
    const correct = responses.filter(r => r.isCorrect).length;
    return Math.round((correct / questions.length) * 100);
  };

  const handleComplete = () => {
    const score = calculateScore();
    const passed = score >= PASSING_SCORE;
    onComplete(passed, score, responses);
  };

  const handleRetry = () => {
    // Reset and get new questions
    const newQuestions = getAssessmentQuestions(realm, 5);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setResponses([]);
    setAssessmentComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading assessment...</div>
      </div>
    );
  }

  // Assessment Results Screen
  if (assessmentComplete) {
    const score = calculateScore();
    const passed = score >= PASSING_SCORE;
    const correctCount = responses.filter(r => r.isCorrect).length;

    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          {/* Result Icon */}
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
            passed ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
          )}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-600 dark:text-green-400" />
            ) : (
              <BookOpen className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          {/* Result Message */}
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            <p className="text-muted-foreground">
              {passed 
                ? `You've demonstrated understanding of the ${realmInfo.name} realm!`
                : `You need ${PASSING_SCORE}% to pass. Let's review and try again.`
              }
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="text-5xl font-bold mb-2" style={{ color: passed ? 'var(--green-500)' : 'var(--amber-500)' }}>
              {score}%
            </div>
            <p className="text-sm text-muted-foreground">
              {correctCount} of {questions.length} questions correct
            </p>
          </div>

          {/* Realm Badge */}
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="text-2xl">{realmInfo.icon}</span>
            <span className="font-semibold">{realmInfo.fullName}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-4">
            {passed ? (
              <Button onClick={handleComplete} size="lg" className="gap-2">
                Continue Journey
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onBack}>
                  Review Material
                </Button>
                <Button onClick={handleRetry} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Question Screen
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{realmInfo.icon}</span>
            <span className="font-medium text-sm text-muted-foreground">
              {realmInfo.name} Assessment
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {currentQuestion.questionText}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctOptionIndex;
            const showCorrectness = showResult;

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-secondary/30",
                  isSelected && !showResult && "border-primary bg-primary/10",
                  showCorrectness && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                  showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                  showResult && "cursor-default"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected && !showResult && "border-primary bg-primary text-primary-foreground",
                    showCorrectness && isCorrect && "border-green-500 bg-green-500 text-white",
                    showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white"
                  )}>
                    {showCorrectness && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                    {showCorrectness && isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                    {!showCorrectness && isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <span className={cn(
                    showCorrectness && isCorrect && "font-medium text-green-700 dark:text-green-300",
                    showCorrectness && isSelected && !isCorrect && "text-red-700 dark:text-red-300"
                  )}>
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation (shown after answer) */}
      {showResult && (
        <div className={cn(
          "p-4 rounded-lg mb-6",
          selectedOption === currentQuestion.correctOptionIndex
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        )}>
          <p className="text-sm">
            <span className="font-semibold">Explanation: </span>
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        
        {!showResult ? (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={selectedOption === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="gap-2">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
