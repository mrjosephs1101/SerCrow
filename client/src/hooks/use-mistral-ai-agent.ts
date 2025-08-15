// hooks/use-mistral-ai-agent.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function useMistralAIAgent() {
  return useMutation({
    mutationFn: async (messages: Message[]) => {
      const response = await axios.post(
        MISTRAL_API_URL,
        {
          model: 'mistral-tiny', // swap with mistral-medium or mistral-large if desired
          messages,
          temperature: 0.7,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices?.[0]?.message?.content || '...WingMan is speechless.';
    },
  });
}
