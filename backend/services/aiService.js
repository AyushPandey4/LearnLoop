const { YoutubeTranscript } = require('youtube-transcript');
const { setCache, getCache } = require('../config/redisUtils');
const axios = require('axios');

// Custom error classes for better error handling
class TranscriptError extends Error {
  constructor(message, videoId) {
    super(message);
    this.name = 'TranscriptError';
    this.videoId = videoId;
  }
}

class SummaryGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'SummaryGenerationError';
    this.cause = cause;
  }
}

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt for content generation
 * @returns {Promise<string>} - Generated content
 */
const generateWithGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Gemini API key is missing in environment variables');
    throw new SummaryGenerationError('Gemini API key is not configured');
  }

  try {
    console.log('Making request to Gemini API...');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // console.log('Received response from Gemini API:', JSON.stringify(response.data, null, 2));

    if (!response.data) {
      console.error('No data received from Gemini API');
      throw new SummaryGenerationError('No response data from Gemini API');
    }

    if (response.data.promptFeedback?.blockReason) {
      console.error('Content blocked by Gemini API:', response.data.promptFeedback);
      throw new SummaryGenerationError('Content was blocked by safety settings');
    }

    if (!response.data.candidates || !response.data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure from Gemini API:', response.data);
      throw new SummaryGenerationError('Invalid response structure from Gemini API');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in generateWithGemini:', error.response?.data || error.message);
    
    if (error instanceof SummaryGenerationError) {
      throw error;
    }
    
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || 'Unknown API error';
      console.error('Gemini API error details:', errorMessage);
      throw new SummaryGenerationError(`Gemini API error: ${errorMessage}`);
    }
    
    throw new SummaryGenerationError('Failed to generate content with Gemini', error);
  }
};

/**
 * Fetch transcript for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Combined transcript text
 */
const getYouTubeTranscript = async (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    throw new TranscriptError('Invalid video ID provided', videoId);
  }

  try {
    // Check cache first
    const cacheKey = `transcript:${videoId}`;
    const cachedTranscript = await getCache(cacheKey);
    
    if (cachedTranscript) {
      return cachedTranscript;
    }
    
    console.log('Fetching transcript for video:', videoId);
    // Fetch transcript if not in cache
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new TranscriptError('No transcript available for this video', videoId);
    }
    
    // Combine transcript segments into one text
    const transcriptText = transcript.map(item => item.text).join(' ');
    
    // Cache the transcript for 7 days (since transcripts rarely change)
    await setCache(cacheKey, transcriptText, 7 * 24 * 60 * 60);
    
    return transcriptText;
  } catch (error) {
    console.error('Error in getYouTubeTranscript:', error);
    if (error instanceof TranscriptError) {
      throw error;
    }
    throw new TranscriptError(
      `Failed to fetch transcript: ${error.message}`,
      videoId
    );
  }
};

/**
 * Generate a summary from transcript text using Gemini
 * @param {string} transcript - Video transcript
 * @param {string} videoTitle - Video title for context
 * @returns {Promise<string>} - Generated summary
 */
const generateSummaryFromTranscript = async (transcript, videoTitle) => {
  if (!transcript || typeof transcript !== 'string') {
    throw new SummaryGenerationError('Invalid transcript provided');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new SummaryGenerationError('Gemini API key is not configured');
  }

  try {
    // Check if transcript is too long and truncate if needed
    const maxLength = 30000; // Adjust based on Gemini's limits
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.substring(0, maxLength) + '...' 
      : transcript;
    
    console.log('Generating summary for video:', videoTitle);
    const prompt = `Please provide a comprehensive summary of this educational video titled "${videoTitle || 'Untitled'}". 
Focus on the key concepts, main points, and important takeaways. Format the summary with:
- Main topics as bullet points
- Brief explanations under each point
- Any important examples or demonstrations mentioned
- Key conclusions or insights

Here's the transcript:
${truncatedTranscript}

Please keep the summary clear, concise, and well-structured.`;

    const summary = await generateWithGemini(prompt);
    
    if (!summary) {
      throw new SummaryGenerationError('No summary content generated');
    }

    return summary.trim();
  } catch (error) {
    console.error('Error in generateSummaryFromTranscript:', error);
    if (error instanceof SummaryGenerationError) {
      throw error;
    }
    throw new SummaryGenerationError(
      'Failed to generate summary',
      error
    );
  }
};

/**
 * Generate AI summary for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @param {string} videoTitle - Video title
 * @returns {Promise<string>} - Generated summary
 */
const generateVideoSummary = async (videoId, videoTitle) => {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('Invalid video ID provided');
  }

  try {
    console.log('Starting summary generation for video:', videoId);
    // Check if summary is cached
    const cacheKey = `summary:${videoId}`;
    const cachedSummary = await getCache(cacheKey);
    
    if (cachedSummary) {
      console.log('Returning cached summary for video:', videoId);
      return cachedSummary;
    }
    
    // Get transcript
    const transcript = await getYouTubeTranscript(videoId);
    
    // Generate summary
    const summary = await generateSummaryFromTranscript(transcript, videoTitle);
    
    // Cache the summary for 30 days
    await setCache(cacheKey, summary, 30 * 24 * 60 * 60);
    
    console.log('Successfully generated summary for video:', videoId);
    return summary;
  } catch (error) {
    console.error(`Error generating summary for ${videoId}:`, error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof TranscriptError) {
      throw new Error(`Failed to get video transcript: ${error.message}`);
    } else if (error instanceof SummaryGenerationError) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

module.exports = {
  generateVideoSummary,
  TranscriptError,
  SummaryGenerationError
}; 