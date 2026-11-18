/**
 * Native Vercel Serverless Function: Conversational AI Clean Air Advisor
 * Path: /api/v1/chat
 *
 * Supports live Google Gemini 1.5 Flash via REST API if an API key is provided
 * via environment variables or request headers, with instant zero-downtime fallback.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const userMessage = body.message || '';
  const current_aqi = Number(body.current_aqi) || 250;
  const vulnerability = body.vulnerability || 'GENERAL_HOUSEHOLD';

  // Check for API key from environment or request headers/body
  const apiKey = req.headers['x-gemini-api-key'] || body.apiKey || process.env.GEMINI_API_KEY;

  // If an API key is provided, attempt live Google Gemini call
  if (apiKey && userMessage) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt =
        `You are AeroShield AI, an expert environmental scientist and public health consultant specializing in severe winter smog, thermal inversions, and indoor air quality (IAQ).\n` +
        `Current Ambient AQI: ${current_aqi}\n` +
        `Target Household Health Vulnerability: ${vulnerability}\n` +
        `Provide concise (2-3 paragraphs), actionable, scientifically grounded advice explaining the direct health and emissions impact of choices.`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
            },
          ],
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return res.status(200).json({
            reply: candidate,
            suggested_quick_chips: [
              'How to construct a Corsi-Rosenthal box under $35?',
              'When is the safest ventilation window today?',
              'What mask is best for children during peak smog?',
            ],
            actionable_takeaway: 'Follow live air filtration protocols and seal windows during morning inversion peaks.',
            model_used: 'Google Gemini 1.5 Flash (Live API)',
          });
        }
      }
    } catch (e) {
      console.warn('[AeroShield] Gemini live API call failed, activating resilient fallback:', e);
    }
  }

  // Resilient expert fallback (ensures 100% uptime without API keys)
  const msgLower = userMessage.toLowerCase();
  let reply = '';
  let chips = [];
  let takeaway = '';

  if (msgLower.includes('corsi') || msgLower.includes('box') || msgLower.includes('filter') || msgLower.includes('diy')) {
    reply =
      'To build an ultra-effective DIY Corsi-Rosenthal box for under $35:\n' +
      '1. Assemble four 20x20-inch MERV-13 furnace filters into a square cube (arrows pointing inward).\n' +
      '2. Tape bottom with cardboard to make an airtight base.\n' +
      '3. Place a standard 20-inch box fan on top, blowing upward.\n' +
      '4. Seal all perimeter seams thoroughly with duct tape.\n\n' +
      'This configuration provides a CADR of ~220 CFM for PM2.5, matching or outperforming $300 commercial HEPA units.';
    chips = [
      'How often should I change DIY filters?',
      'Can I use a single-filter fan setup?',
      'Is MERV-11 sufficient instead of MERV-13?',
    ];
    takeaway = 'Build a 4-filter Corsi-Rosenthal cube using MERV-13 filters for maximum particle capture.';
  } else if (msgLower.includes('ventilate') || msgLower.includes('window') || msgLower.includes('air out')) {
    reply =
      `Under current ambient conditions (AQI ${current_aqi}), outdoor air is hazardous to inhale directly.\n` +
      'In winter, thermal inversions trap ground pollutants tightest in early morning (06:00-10:00) and evening (18:00+).\n' +
      '• Keep all windows sealed shut during inversion peaks.\n' +
      '• If ventilation is mandatory, restrict it to a 10-minute flush between 13:00 and 15:00 when solar convection breaks the inversion.\n' +
      '• Always run indoor air filtration on high immediately after re-closing windows.';
    chips = [
      'How to create a positive pressure clean room?',
      'What weather signs indicate the inversion is breaking?',
      'How to test indoor air without expensive sensors?',
    ];
    takeaway = 'Seal all windows during morning and evening inversions; only ventilate briefly around 13:00-15:00.';
  } else if (msgLower.includes('child') || msgLower.includes('kid') || msgLower.includes('school') || msgLower.includes('baby')) {
    reply =
      "Children's respiratory defenses are still developing, and they inhale up to 50% more air per pound of body weight:\n" +
      '1. School Commute: Provide snug, well-fitted KF94 or KN95 child-size masks.\n' +
      '2. Physical Education: Outdoor sports should be moved indoors whenever AQI exceeds 150.\n' +
      '3. Carpooling: Group kids into electric or hybrid carpools, and strictly enforce engine shut-off (no idling) during pickup.';
    chips = [
      'What mask types work best for toddlers?',
      'How to advocate for clean air zones around schools?',
      'Safe indoor active games during severe smog days?',
    ];
    takeaway = 'Enforce child-sized KF94/KN95 masks and relocate all exercise to filtered indoor spaces.';
  } else {
    reply =
      `Regarding your inquiry on '${userMessage}' for a household navigating AQI ${current_aqi}:\n` +
      '1. Prioritize source control: Avoid burning candles, incense, or biomass indoors, and always use exhaust hoods when cooking.\n' +
      '2. Enforce active room filtration in bedrooms and main living spaces.\n' +
      '3. Consolidate outdoor vehicle trips into clean off-peak transit windows to cut community emissions.\n' +
      '4. Stay hydrated and use saline nasal sprays to protect mucous membranes.';
    chips = [
      'How to build a Corsi-Rosenthal box under $35?',
      'When is the safest time to ventilate today?',
      'Low-emission heating alternatives for winter?',
    ];
    takeaway = 'Maintain indoor air filtration and eliminate indoor particle sources like cooking smoke and candles.';
  }

  return res.status(200).json({
    reply,
    suggested_quick_chips: chips,
    actionable_takeaway: takeaway,
    model_used: 'AeroShield Resilient Domain Heuristic Engine',
  });
}
