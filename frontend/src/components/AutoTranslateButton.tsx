import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { useOllama } from '@/hooks/useOllama';

interface AutoTranslateButtonProps {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  onTranslated: (text: string) => void;
  className?: string;
}

export default function AutoTranslateButton({
  sourceText,
  sourceLang,
  targetLang,
  onTranslated,
  className = ""
}: AutoTranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const { isConfigured } = useOllama();

  const handleTranslate = async () => {
    if (!sourceText) {
      toast.error('No text to translate');
      return;
    }

    try {
      setIsTranslating(true);
      const translated = await apiClient.translate(sourceText, sourceLang, targetLang);
      onTranslated(translated);
      toast.success('Translation completed!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Check Ollama settings.');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isConfigured) return null;

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isTranslating}
      className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md transition-all flex items-center gap-1.5 backdrop-blur-md z-10 ${className}`}
      title={`Auto translate from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}`}
    >
      {isTranslating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      {isTranslating ? 'Translating...' : 'Auto'}
    </button>
  );
}
