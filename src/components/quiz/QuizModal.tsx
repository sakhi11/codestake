
import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, Clock, Code } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import CodeEditor from "./CodeEditor";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
  track: string;
  milestone: {
    id: string;
    name: string;
    reward: number;
  };
}

const QuizModal = ({ isOpen, onClose, onComplete, track, milestone }: QuizModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [codeAnswer, setCodeAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);
  
  // Example quiz data based on track and milestone
  const quizData = getQuizData(track, milestone.id);
  
  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex,
    });
  };
  
  const handleCodeChange = (value: string) => {
    setCodeAnswer(value);
  };
  
  const isAnswered = (questionIndex: number) => {
    return typeof answers[questionIndex] === "number";
  };
  
  const canProceed = () => {
    if (currentStep < quizData.mcqs.length) {
      return isAnswered(currentStep);
    }
    return codeAnswer.trim().length > 0;
  };
  
  const handleNext = () => {
    if (currentStep < quizData.mcqs.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitQuiz();
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    // In a real implementation, this would call an API to validate answers
    // and run code through test cases
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation: count correct MCQ answers (option index 0 is correct in this demo)
    const correctAnswers = Object.values(answers).filter(answer => answer === 0).length;
    const totalQuestions = quizData.mcqs.length;
    const percentageCorrect = (correctAnswers / totalQuestions) * 100;
    
    // For demo purposes: consider quiz passed if 60% of MCQs are correct and code is not empty
    const passed = percentageCorrect >= 60 && codeAnswer.trim().length > 50;
    
    setQuizResult({ passed, score: percentageCorrect });
    setIsSubmitting(false);
  };
  
  const handleFinish = () => {
    if (quizResult) {
      onComplete(quizResult.passed);
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  const renderContent = () => {
    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse text-web3-blue">
            <Clock className="h-16 w-16 mb-4 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Evaluating Your Answers...</h3>
          <p className="text-white/70 text-center mb-6">
            We're checking your answers and running tests on your code.
          </p>
          <Progress value={75} className="w-64 h-2 bg-white/10" />
        </div>
      );
    }
    
    if (quizResult) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          {quizResult.passed ? (
            <>
              <div className="text-web3-success mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Congratulations!</h3>
              <p className="text-white/70 text-center mb-6">
                You've successfully completed this milestone quiz with a score of {quizResult.score.toFixed(0)}%.
              </p>
              <Button 
                className="group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
                style={{
                  background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
                }}
                onClick={handleFinish}
              >
                <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <CheckCircle className="mr-2 h-4 w-4" />
                Claim {milestone.reward} ETH Reward
              </Button>
            </>
          ) : (
            <>
              <div className="text-web3-orange mb-4">
                <AlertTriangle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Not Quite There Yet</h3>
              <p className="text-white/70 text-center mb-6">
                You scored {quizResult.score.toFixed(0)}%. You need at least 60% to pass this milestone.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={onClose}
                >
                  Try Again Later
                </Button>
                <Button 
                  onClick={() => {
                    setQuizResult(null);
                    setCurrentStep(0);
                    setAnswers({});
                    setCodeAnswer("");
                  }}
                >
                  Retry Quiz
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }
    
    if (currentStep < quizData.mcqs.length) {
      // Show MCQ questions
      const question = quizData.mcqs[currentStep];
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold">Question {currentStep + 1} of {quizData.mcqs.length}</h3>
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/70">
              MCQ Section
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-white text-lg mb-6">{question.question}</p>
            
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-white/5 ${
                    answers[currentStep] === optionIndex 
                      ? "border-web3-blue bg-white/5" 
                      : "border-white/10"
                  }`}
                  onClick={() => handleOptionSelect(currentStep, optionIndex)}
                >
                  <div className="flex items-start">
                    <div 
                      className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                        answers[currentStep] === optionIndex 
                          ? "border-web3-blue bg-web3-blue/20" 
                          : "border-white/30"
                      }`}
                    >
                      {answers[currentStep] === optionIndex && (
                        <div className="w-2.5 h-2.5 rounded-full bg-web3-blue" />
                      )}
                    </div>
                    <p className="text-white/90">{option}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      // Show coding challenge
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold">Coding Challenge</h3>
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/70 flex items-center">
              <Code className="w-4 h-4 mr-1" />
              Code Section
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-white text-lg mb-3">{quizData.codingChallenge.problem}</p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-white/70 text-sm mb-2">Instructions:</p>
              <ul className="list-disc pl-5 text-white/70 text-sm space-y-1">
                {quizData.codingChallenge.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
            
            <CodeEditor 
              value={codeAnswer}
              onChange={handleCodeChange}
              language={track.toLowerCase().includes("javascript") ? "javascript" : 
                       track.toLowerCase().includes("python") ? "python" : 
                       track.toLowerCase().includes("solidity") ? "solidity" : "javascript"}
            />
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative glassmorphism border border-white/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-web3-background/90 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gradient">
            {milestone.name} Quiz
          </h2>
          
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Progress indicator */}
          {!quizResult && !isSubmitting && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Progress</span>
                <span>{((currentStep / (quizData.mcqs.length + 1)) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={(currentStep / (quizData.mcqs.length + 1)) * 100} 
                className="h-1 bg-white/10" 
              />
            </div>
          )}
          
          {renderContent()}
        </div>
        
        {!quizResult && !isSubmitting && (
          <div className="sticky bottom-0 z-10 bg-web3-background/90 backdrop-blur-sm border-t border-white/10 p-4 flex justify-between">
            {currentStep > 0 ? (
              <Button 
                variant="outline" 
                onClick={handlePrev}
              >
                Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              disabled={!canProceed()}
              onClick={handleNext}
            >
              {currentStep < quizData.mcqs.length ? "Next" : "Submit Quiz"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get quiz data based on track and milestone
function getQuizData(track: string, milestoneId: string) {
  // Extract milestone number
  const milestoneNumber = parseInt(milestoneId.replace('m', ''));
  
  // Default quiz structure
  const defaultQuiz = {
    mcqs: [
      {
        question: "What is the correct way to declare a variable in this language?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"]
      },
      {
        question: "Which statement correctly creates a function?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"]
      },
      {
        question: "How do you properly handle asynchronous operations?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"]
      },
      {
        question: "What is the best practice for error handling?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"]
      },
      {
        question: "How do you optimize code performance?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"]
      }
    ],
    codingChallenge: {
      problem: "Default coding challenge",
      instructions: ["Write a function", "Include proper error handling", "Return the expected result"],
      starterCode: "// Write your code here",
      testCases: ["test1", "test2", "test3"]
    }
  };
  
  // Track-specific quiz data
  if (track.toLowerCase().includes("javascript")) {
    const jsQuizzes = [
      {
        // Milestone 1: JavaScript Basics
        mcqs: [
          {
            question: "Which of the following is the correct way to declare a variable in JavaScript?",
            options: ["let x = 10;", "variable x = 10;", "x = 10;", "int x = 10;"]
          },
          {
            question: "What will be the output of console.log(typeof [])?",
            options: ["object", "array", "undefined", "string"]
          },
          {
            question: "Which loop will always execute at least once?",
            options: ["do...while", "while", "for", "forEach"]
          },
          {
            question: "What is the correct way to create a function in JavaScript?",
            options: ["function myFunction() {}", "create myFunction() {}", "new Function() {}", "function:myFunction {}"]
          },
          {
            question: "Which operator is used for strict equality comparison?",
            options: ["===", "==", "=", "<==>"]
          }
        ],
        codingChallenge: {
          problem: "Create a function that finds the maximum number in an array",
          instructions: [
            "Write a function named findMax that takes an array of numbers as input",
            "Return the largest number in the array",
            "Do not use built-in Math.max method"
          ],
          starterCode: "function findMax(numbers) {\n  // Write your code here\n}",
          testCases: ["findMax([1, 3, 5, 2, 9, 7]) should return 9"]
        }
      },
      // More milestones would be defined here...
    ];
    
    return milestoneNumber <= jsQuizzes.length ? jsQuizzes[milestoneNumber - 1] : defaultQuiz;
  }
  else if (track.toLowerCase().includes("solidity")) {
    const solidityQuizzes = [
      {
        // Milestone 1: Solidity Basics
        mcqs: [
          {
            question: "Which of these is the correct file extension for Solidity?",
            options: [".sol", ".solidity", ".eth", ".smart"]
          },
          {
            question: "What keyword is used to declare a Smart Contract?",
            options: ["contract", "class", "interface", "struct"]
          },
          {
            question: "Which data location is NOT valid in Solidity?",
            options: ["heap", "memory", "storage", "calldata"]
          },
          {
            question: "What is the purpose of the 'view' function modifier?",
            options: [
              "It indicates that the function does not modify state",
              "It makes the function visible to other contracts",
              "It ensures the function can receive ETH",
              "It restricts the function to only be called by the owner"
            ]
          },
          {
            question: "Which of these is NOT a valid value type in Solidity?",
            options: ["char", "uint", "address", "bool"]
          }
        ],
        codingChallenge: {
          problem: "Create a simple token contract",
          instructions: [
            "Create a contract named 'SimpleToken'",
            "Add a public string variable 'name' with value 'MyToken'",
            "Add a public uint256 variable 'totalSupply' with value 1000000",
            "Add a public mapping to track balances (address => uint256)",
            "In the constructor, assign all tokens to the deployer's address"
          ],
          starterCode: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract SimpleToken {\n  // Write your code here\n}",
          testCases: ["Contract should compile without errors"]
        }
      }
    ];
    
    return milestoneNumber <= solidityQuizzes.length ? solidityQuizzes[milestoneNumber - 1] : defaultQuiz;
  }
  
  // Return default quiz for other tracks
  return defaultQuiz;
}

export default QuizModal;
