import { callLLM } from '../../aiClient.js';

export const runBookingAgent = async ({ prompt, language = 'en', customerLocation }) => {
  const systemPrompt = `You are Co-opSeva's AI Booking Agent. Your job is to understand user natural language requests (in English, Hindi, or Hinglish) for home and artisanal services, extract the service category, urgency level, scheduled time, and customer's problem description. Output valid JSON.`;
  
  const userPrompt = `User Request: "${prompt}"\nCustomer Location: ${JSON.stringify(customerLocation || {})}`;

  const response = await callLLM({
    systemPrompt,
    userPrompt,
    responseFormat: 'json'
  });

  return response;
};
