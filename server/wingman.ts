import type { SearchResult } from '@shared/schema';

// WingMan AI Assistant for SerCrow using OpenRouter API
export class WingMan {
  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;
  private isAvailable: boolean = false;
  private hfApiKey: string;
  private hfImageModel: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.defaultModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo-preview';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.hfImageModel = process.env.HUGGINGFACE_IMAGE_MODEL || 'runwayml/stable-diffusion-v1-5';
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    if (!this.apiKey) {
      this.isAvailable = false;
      console.warn('⚠️ OpenRouter API key not configured. WingMan AI features disabled.');
      return;
    }

    try {
      // Test the API connection
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.isAvailable = true;
        console.log('🤖 WingMan AI Assistant is ready with OpenRouter!');
      } else {
        this.isAvailable = false;
        console.warn('⚠️ OpenRouter API connection failed. WingMan AI features disabled.');
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('⚠️ OpenRouter API not available. WingMan AI features disabled.');
    }
  }

  public getStatus(): { available: boolean; model: string; provider: string; imageModel?: string } {
    return {
      available: this.isAvailable,
      model: this.defaultModel,
      provider: 'OpenRouter',
      imageModel: this.hfImageModel,
    };
  }

  private async callOpenRouter(prompt: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sercrow.ai',
        'X-Title': 'SerCrow WingMan AI Assistant'
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Smart search query enhancement and suggestions
  public async enhanceSearchQuery(query: string): Promise<{
    original: string;
    enhanced: string;
    suggestions: string[];
    intent: string;
  }> {
    if (!this.isAvailable) {
      return {
        original: query,
        enhanced: query,
        suggestions: [],
        intent: 'web_search'
      };
    }

    try {
      const prompt = `
Analyze this search query and help improve it for better search results.

Query: "${query}"

Provide:
1. Enhanced version of the query (more specific, better keywords)
2. 3 alternative search suggestions
3. Search intent (web_search, image_search, video_search, news_search, academic_search, shopping, local_search, definition)

Respond in this exact JSON format:
{
  "enhanced": "enhanced query here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "intent": "search_type_here"
}`;

      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.7,
        max_tokens: 200
      });

      const result = JSON.parse(responseText);
      
      return {
        original: query,
        enhanced: result.enhanced || query,
        suggestions: result.suggestions || [],
        intent: result.intent || 'web_search'
      };
    } catch (error) {
      console.error('WingMan query enhancement error:', error);
      return {
        original: query,
        enhanced: query,
        suggestions: [],
        intent: 'web_search'
      };
    }
  }

  // Generate AI summary of search results
  public async summarizeResults(query: string, results: SearchResult[]): Promise<{
    summary: string;
    keyPoints: string[];
    confidence: number;
  }> {
    if (!this.isAvailable || results.length === 0) {
      return {
        summary: '',
        keyPoints: [],
        confidence: 0
      };
    }

    try {
      // Take top 5 results for summarization
      const topResults = results.slice(0, 5);
      const resultsText = topResults.map((result, index) => 
        `${index + 1}. ${result.title}\n   ${result.description}`
      ).join('\n\n');

      const prompt = `
Based on these search results for the query "${query}", provide a comprehensive summary.

Search Results:
${resultsText}

Provide:
1. A clear, informative summary (2-3 sentences)
2. 3-5 key points from the results
3. Confidence level (0-100) in the information accuracy

Respond in this exact JSON format:
{
  "summary": "comprehensive summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "confidence": 85
}`;

      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.3,
        max_tokens: 300
      });

      const result = JSON.parse(responseText);
      
      return {
        summary: result.summary || '',
        keyPoints: result.keyPoints || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error('WingMan summarization error:', error);
      return {
        summary: '',
        keyPoints: [],
        confidence: 0
      };
    }
  }

  // Direct question answering
  public async answerQuestion(question: string, context?: SearchResult[]): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
    followUpQuestions: string[];
  }> {
    if (!this.isAvailable) {
      return {
        answer: '',
        sources: [],
        confidence: 0,
        followUpQuestions: []
      };
    }

    try {
      let contextText = '';
      let sources: string[] = [];
      
      if (context && context.length > 0) {
        contextText = context.slice(0, 3).map((result, index) => {
          sources.push(result.url);
          return `Source ${index + 1}: ${result.title}\n${result.description}`;
        }).join('\n\n');
      }

      const prompt = `
Answer this question using the provided context (if available) and your knowledge.

Question: "${question}"

${contextText ? `Context from search results:\n${contextText}\n` : ''}

Provide:
1. A clear, accurate answer
2. Confidence level (0-100)
3. 3 relevant follow-up questions

${contextText ? 'If using context, cite the sources.' : 'Answer based on general knowledge.'}

Respond in this exact JSON format:
{
  "answer": "detailed answer here",
  "confidence": 90,
  "followUpQuestions": ["question 1?", "question 2?", "question 3?"]
}`;

      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.2,
        max_tokens: 400
      });

      const result = JSON.parse(responseText);
      
      return {
        answer: result.answer || '',
        sources,
        confidence: result.confidence || 0,
        followUpQuestions: result.followUpQuestions || []
      };
    } catch (error) {
      console.error('WingMan question answering error:', error);
      return {
        answer: '',
        sources: [],
        confidence: 0,
        followUpQuestions: []
      };
    }
  }

  // Smart search suggestions based on search history and trends
  public async generateSmartSuggestions(partialQuery: string, searchHistory?: string[]): Promise<string[]> {
    if (!this.isAvailable || partialQuery.length < 2) {
      return [];
    }

    try {
      const historyContext = searchHistory && searchHistory.length > 0 
        ? `Recent searches: ${searchHistory.slice(0, 5).join(', ')}`
        : '';

      const prompt = `
Generate 5 smart search suggestions for the partial query "${partialQuery}".

${historyContext}

Consider:
- Popular search trends
- Related topics
- Different search intents
- Completion of partial words

Respond with just a JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]`;

      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.8,
        max_tokens: 150
      });

      const suggestions = JSON.parse(responseText);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('WingMan smart suggestions error:', error);
      return [];
    }
  }

  // Image generation via Hugging Face Inference API
  public async generateImage(prompt: string, size: string = '1024x1024'): Promise<{ images: string[]; provider: string; model: string }> {
    if (!this.hfApiKey) {
      console.warn('Hugging Face API key not configured. Image generation disabled.');
      return { images: [], provider: 'HuggingFace', model: this.hfImageModel };
    }

    try {
      const url = `https://api-inference.huggingface.co/models/${this.hfImageModel}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Many text-to-image models accept plain string in "inputs"
          inputs: prompt,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HF image API error ${response.status}: ${errText}`);
      }

      // HF returns binary image (image/png or image/jpeg) for many models. If JSON, handle accordingly.
      const contentType = response.headers.get('content-type') || '';
      const images: string[] = [];
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // Some models return { images: [base64,...] } or similar; try to normalize
        if (Array.isArray(data?.images)) {
          for (const item of data.images) {
            if (typeof item === 'string') {
              images.push(item.startsWith('data:') ? item : `data:image/png;base64,${item}`);
            }
          }
        }
      } else {
        const buffer = await response.arrayBuffer();
        const b64 = Buffer.from(buffer).toString('base64');
        images.push(`data:image/png;base64,${b64}`);
      }

      return { images, provider: 'HuggingFace', model: this.hfImageModel };
    } catch (error) {
      console.error('WingMan image generation error:', error);
      return { images: [], provider: 'HuggingFace', model: this.hfImageModel };
    }
  }

  // Content analysis and categorization
  public async analyzeContent(title: string, description: string): Promise<{
    category: string;
    relevanceScore: number;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    if (!this.isAvailable) {
      return {
        category: 'general',
        relevanceScore: 50,
        tags: [],
        sentiment: 'neutral'
      };
    }

    try {
      const prompt = `
Analyze this content and categorize it:

Title: "${title}"
Description: "${description}"

Provide:
1. Category (technology, science, news, entertainment, business, health, sports, education, etc.)
2. Relevance score (0-100)
3. 3-5 relevant tags
4. Sentiment (positive, neutral, negative)

Respond in this exact JSON format:
{
  "category": "category_name",
  "relevanceScore": 85,
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "neutral"
}`;

      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.1,
        max_tokens: 150
      });

      const result = JSON.parse(responseText);
      
      return {
        category: result.category || 'general',
        relevanceScore: result.relevanceScore || 50,
        tags: result.tags || [],
        sentiment: result.sentiment || 'neutral'
      };
    } catch (error) {
      console.error('WingMan content analysis error:', error);
      return {
        category: 'general',
        relevanceScore: 50,
        tags: [],
        sentiment: 'neutral'
      };
    }
  }
}

// Singleton instance
export const wingman = new WingMan();
