import { callLLM } from '../../aiClient.js';

export const runBookingAgent = async ({ prompt, language = 'en', customerLocation }) => {
  const systemPrompt = `You are Co-opSeva's AI Booking Agent.
Your job is to understand user natural language service requests (in English, Hindi, or Hinglish) for home and artisanal services.
Extract:
- serviceCategory (one of: Plumbing, Electrical, Carpentry, Painting, Cleaning, Gardening, Driver, Caregiving, Appliance Repair)
- isEmergency (boolean: true if user indicates burst pipes, sparking, flooding, danger, immediate need)
- urgency ("NORMAL" or "HIGH_EMERGENCY")
- scheduleRequested (e.g. "Immediate (Within 25 mins)" or "Tomorrow 10 AM")
- detectedLanguage (e.g. "English", "Hindi (हिन्दी)", "Marathi")
- customerProblemSummary (short summary of the problem)

Return JSON with format:
{
  "extractedIntent": {
    "serviceCategory": "Plumbing",
    "isEmergency": true,
    "urgency": "HIGH_EMERGENCY",
    "customerProblemSummary": "Leaking kitchen pipe",
    "detectedLanguage": "English",
    "scheduleRequested": "Immediate"
  },
  "suggestedServiceId": "srv_plumb_01",
  "agentMessage": "Urgent plumbing emergency detected."
}`;
  
  const userPrompt = `User Request: "${prompt}"\nCustomer Location: ${JSON.stringify(customerLocation || {})}`;

  const raw = await callLLM({
    systemPrompt,
    userPrompt,
    responseFormat: 'json'
  });

  // Normalize response
  let intent = raw.extractedIntent || raw;
  let category = intent.serviceCategory || raw.category || 'Plumbing';
  // Capitalize properly
  category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  if (category.includes('Plumb')) category = 'Plumbing';
  else if (category.includes('Elect')) category = 'Electrical';
  else if (category.includes('Clean')) category = 'Cleaning';
  else if (category.includes('Carp')) category = 'Carpentry';
  else if (category.includes('Paint')) category = 'Painting';
  else if (category.includes('Garden')) category = 'Gardening';
  else if (category.includes('Appliance') || category.includes('Ac')) category = 'Appliance Repair';
  else if (category.includes('Care')) category = 'Caregiving';
  else if (category.includes('Driv')) category = 'Driver';

  const isEmergency = Boolean(intent.isEmergency ?? raw.isEmergency ?? false);

  const normalizedIntent = {
    serviceCategory: category,
    isEmergency,
    urgency: isEmergency ? 'HIGH_EMERGENCY' : (intent.urgency || 'NORMAL'),
    customerProblemSummary: intent.customerProblemSummary || prompt,
    detectedLanguage: intent.detectedLanguage || (prompt.match(/[\u0900-\u097F]/) ? 'Hindi (हिन्दी)' : 'English'),
    scheduleRequested: intent.scheduleRequested || (isEmergency ? 'Immediate (Within 25 mins)' : 'Today, as soon as possible'),
    requiredSkillLevel: isEmergency ? 'EXPERT' : 'INTERMEDIATE',
    confidence: 0.96
  };

  const serviceIdMap = {
    'Plumbing': 'srv_plumb_01',
    'Electrical': 'srv_elec_02',
    'Carpentry': 'srv_carp_03',
    'Painting': 'srv_paint_04',
    'Cleaning': 'srv_clean_05',
    'Gardening': 'srv_gard_06',
    'Appliance Repair': 'srv_appl_07',
    'Caregiving': 'srv_care_08',
    'Driver': 'srv_driv_09'
  };

  return {
    extractedIntent: normalizedIntent,
    suggestedServiceId: raw.suggestedServiceId || serviceIdMap[category] || 'srv_plumb_01',
    agentMessage: raw.agentMessage || (isEmergency
      ? `🚨 Urgent ${category} emergency detected. Priority matching initiated with certified nearby workers.`
      : `Understood! Looking for verified cooperative ${category} specialists with optimal fair workload balance.`)
  };
};
