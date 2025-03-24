
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CodeEditor from './CodeEditor';
import { X } from 'lucide-react';

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  onSubmit?: (code: string) => void; // Made optional to fix type error
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, milestone, onSubmit }) => {
  const [code, setCode] = useState('// Write your code here');
  
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code);
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] glassmorphism border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient mb-4">
            Milestone: {milestone?.title || 'Complete Challenge'}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <p className="text-white mb-4">
              {milestone?.description || 'Complete the challenge by writing code that passes all tests.'}
            </p>
            <CodeEditor 
              value={code} 
              onChange={setCode}
              language="javascript" // Add the required language prop
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
