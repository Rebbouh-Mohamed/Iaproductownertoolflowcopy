import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AIButtonProps {
  onReformulate: (text: string) => Promise<string>;
  currentText: string;
  onTextUpdate: (newText: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  tooltip?: string;
  className?: string;
}

export function AIButton({ 
  onReformulate, 
  currentText, 
  onTextUpdate, 
  size = 'sm',
  variant = 'outline',
  tooltip = "Reformuler avec l'IA",
  className = ""
}: AIButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReformulate = async () => {
    if (!currentText.trim()) return;
    
    setIsLoading(true);
    try {
      const reformulatedText = await onReformulate(currentText);
      onTextUpdate(reformulatedText);
    } catch (error) {
      console.error('Erreur lors de la reformulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleReformulate}
            disabled={isLoading || !currentText.trim()}
            className={`${className} transition-all hover:scale-105`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {size !== 'sm' && (
              <span className="ml-2">
                {isLoading ? 'Reformulation...' : 'IA'}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Service de reformulation IA simulé
export const AIReformulationService = {
  async reformulateText(text: string): Promise<string> {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Logique de reformulation simulée avec des améliorations
    const improvements = [
      {
        pattern: /\b(faire|créer|développer)\b/g,
        replacement: (match: string) => {
          const alternatives = {
            'faire': 'réaliser',
            'créer': 'concevoir',
            'développer': 'élaborer'
          };
          return alternatives[match as keyof typeof alternatives] || match;
        }
      },
      {
        pattern: /\b(important|crucial)\b/g,
        replacement: () => 'essentiel'
      },
      {
        pattern: /\b(beaucoup)\b/g,
        replacement: () => 'considérablement'
      },
      {
        pattern: /\b(très)\b/g,
        replacement: () => 'particulièrement'
      }
    ];

    let reformulated = text;
    
    // Appliquer les améliorations
    improvements.forEach(improvement => {
      reformulated = reformulated.replace(improvement.pattern, improvement.replacement);
    });

    // Ajouter des connecteurs logiques
    if (reformulated.includes('.') && !reformulated.includes('Par ailleurs') && !reformulated.includes('De plus')) {
      const sentences = reformulated.split('.');
      if (sentences.length > 2) {
        sentences[1] = ' Par ailleurs,' + sentences[1];
        reformulated = sentences.join('.');
      }
    }

    // Améliorer la structure si le texte est long
    if (reformulated.length > 200) {
      reformulated = reformulated.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');
    }

    return reformulated.trim();
  }
};