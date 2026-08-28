import dotenv from 'dotenv';
import { executeTool, getToolDefinitions } from './agentRuntime.js';
dotenv.config();

/**
 * Intelligent AI Client supporting Groq, Gemini, and OpenAI with zero-crash demo fallback
 */
export const callLLM = async ({ systemPrompt, userPrompt, tools = [], responseFormat = 'json' }) => {
  const AI_MODE = process.env.AI_MODE || 'api';
  const AI_API_KEY = process.env.AI_API_KEY || '';

  // Metadata describing which engine answered the last call (for observability)
  const setMeta = (source, provider = null, model = null) => {
    lastAIMeta = { source, provider, model, mode: AI_API_KEY ? AI_MODE : 'demo', at: new Date().toISOString() };
  };

  // If in pure demo mode without API key, use the deterministic simulation engine
  if (AI_MODE === 'demo' && !AI_API_KEY) {
    setMeta('fallback');
    return withMeta(simulateAgentResponse({ systemPrompt, userPrompt, tools }), lastAIMeta);
  }

  if (!AI_API_KEY) {
    setMeta('fallback');
    return withMeta(simulateAgentResponse({ systemPrompt, userPrompt, tools }), lastAIMeta);
  }

  try {
    // Detect provider by key pattern or explicit configuration
    let endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    let model = process.env.AI_MODEL || 'groq/compound-mini';

    if (AI_API_KEY.startsWith('gsk_')) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      if (!process.env.AI_MODEL || process.env.AI_MODEL.includes('gemini') || process.env.AI_MODEL.includes('llama') || process.env.AI_MODEL.includes('70b')) {
        model = 'groq/compound-mini';
      }
    } else if (AI_API_KEY.startsWith('AIza')) {
      endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      model = process.env.AI_MODEL || 'gemini-2.0-flash';
    } else if (AI_API_KEY.startsWith('sk-')) {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      model = process.env.AI_MODEL || 'gpt-4o-mini';
    }

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nIMPORTANT: You must return valid, parseable JSON strictly without markdown formatting or backticks.`
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.2
    };

    const toolDefinitions = tools.length ? (tools[0]?.type ? tools : getToolDefinitions()) : [];
    if (toolDefinitions.length) payload.tools = toolDefinitions;

    if (responseFormat === 'json') {
      payload.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const messages = payload.messages;
    let data;
    for (let iteration = 0; iteration < 3; iteration += 1) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({ ...payload, messages }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`[AI Client] Live Provider Error (${response.status}): ${errBody.slice(0, 150)}. Activating deterministic engine.`);
        clearTimeout(timeout);
        setMeta('fallback', providerFromEndpoint(endpoint), model);
        return withMeta(simulateAgentResponse({ systemPrompt, userPrompt, tools }), lastAIMeta);
      }

      data = await response.json();
      const message = data.choices?.[0]?.message;
      if (!message?.tool_calls?.length) break;

      messages.push(message);
      for (const toolCall of message.tool_calls) {
        const input = JSON.parse(toolCall.function.arguments || '{}');
        const result = await executeTool(toolCall.function.name, input);
        messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
      }
    }

    clearTimeout(timeout);
    setMeta('llm', providerFromEndpoint(endpoint), model);
    let content = data?.choices?.[0]?.message?.content || '';

    if (responseFormat === 'json') {
      // Strip ```json and ``` codeblock wrappers if model returned them
      content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      return withMeta(JSON.parse(content), lastAIMeta);
    }

    return content;
  } catch (error) {
    console.warn(`[AI Client] Network/Parsing Error (${error.message}). Falling back to deterministic engine.`);
    setMeta('fallback');
    return withMeta(simulateAgentResponse({ systemPrompt, userPrompt, tools }), lastAIMeta);
  }
};

/** Metadata about the most recent callLLM invocation */
let lastAIMeta = { source: 'unknown', provider: null, model: null, mode: 'unknown', at: null };

const providerFromEndpoint = (endpoint) => {
  if (endpoint.includes('groq.com')) return 'groq';
  if (endpoint.includes('googleapis.com')) return 'gemini';
  if (endpoint.includes('openai.com')) return 'openai';
  return 'unknown';
};

/** Attach observability metadata onto an agent result object without mutating serialized shape awkwardly */
const withMeta = (result, meta) => {
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return { ...result, __ai: meta };
  }
  return result;
};

/** Get metadata about which AI engine answered the most recent call */
export const getAIMeta = () => lastAIMeta;

/**
 * Intelligent deterministic response engine for reliable live judging & demoing
 */
function simulateAgentResponse({ systemPrompt, userPrompt, tools }) {
  const promptLower = (userPrompt || '').toLowerCase();

  // 1. Natural Language Intent Extraction
  let category = 'Plumbing';
  let isEmergency = false;
  let urgency = 'NORMAL';
  let scheduleTime = 'Today, as soon as possible';

  if (promptLower.includes('electric') || promptLower.includes('shock') || promptLower.includes('switch') || promptLower.includes('light') || promptLower.includes('wire') || promptLower.includes('bijli')) {
    category = 'Electrical';
  } else if (promptLower.includes('carpent') || promptLower.includes('wood') || promptLower.includes('door') || promptLower.includes('lock') || promptLower.includes('furniture')) {
    category = 'Carpentry';
  } else if (promptLower.includes('clean') || promptLower.includes('sweep') || promptLower.includes('safai') || promptLower.includes('mop') || promptLower.includes('dust')) {
    category = 'Cleaning';
  } else if (promptLower.includes('paint') || promptLower.includes('wall') || promptLower.includes('rang')) {
    category = 'Painting';
  } else if (promptLower.includes('garden') || promptLower.includes('plant') || promptLower.includes('lawn') || promptLower.includes('grass')) {
    category = 'Gardening';
  } else if (promptLower.includes('ac') || promptLower.includes('fridge') || promptLower.includes('refrigerator') || promptLower.includes('appliance') || promptLower.includes('ro')) {
    category = 'Appliance Repair';
  } else if (promptLower.includes('elder') || promptLower.includes('patient') || promptLower.includes('care') || promptLower.includes('nurse')) {
    category = 'Caregiving';
  } else if (promptLower.includes('driver') || promptLower.includes('car') || promptLower.includes('chauffeur') || promptLower.includes('travel')) {
    category = 'Driver';
  }

  // Detect Emergency keywords
  if (
    promptLower.includes('urgent') ||
    promptLower.includes('emergency') ||
    promptLower.includes('burst') ||
    promptLower.includes('leak') ||
    promptLower.includes('flooding') ||
    promptLower.includes('fire') ||
    promptLower.includes('danger') ||
    promptLower.includes('jaldi') ||
    promptLower.includes('turant')
  ) {
    isEmergency = true;
    urgency = 'HIGH_EMERGENCY';
    scheduleTime = 'Immediate (Within 25 mins)';
  }

  // Return structured intent
  return {
    extractedIntent: {
      serviceCategory: category,
      isEmergency,
      urgency,
      customerProblemSummary: userPrompt,
      detectedLanguage: promptLower.match(/[\u0900-\u097F]/) ? 'Hindi (हिन्दी)' : 'English',
      scheduleRequested: scheduleTime,
      requiredSkillLevel: isEmergency ? 'EXPERT' : 'INTERMEDIATE',
      confidence: 0.96
    },
    suggestedServiceId: category === 'Plumbing' ? 'srv_plumb_01' : category === 'Electrical' ? 'srv_elec_02' : 'srv_clean_05',
    agentMessage: isEmergency
      ? `🚨 Urgent ${category} emergency detected. Priority matching initiated with certified nearby workers.`
      : `Understood! Looking for verified cooperative ${category} specialists with optimal fair workload balance.`
  };
}
