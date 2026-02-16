import React from "react";
import { Mic, MicOff } from "lucide-react";

interface Props {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const SpeechButton: React.FC<Props> = ({
  isListening,
  onStart,
  onStop,
}) => {
  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      className={`p-2 rounded-lg transition ${
        isListening
          ? "bg-red-500 text-white"
          : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};