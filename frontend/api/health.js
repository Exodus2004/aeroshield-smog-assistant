/**
 * Native Vercel Serverless Function: Health Check Endpoint
 * Path: /api/health
 */

export default function handler(req, res) {
  // CORS and OWASP Defensive Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'healthy',
    service: 'AeroShield AI Serverless Edge Engine',
    version: '1.0.0',
    engine_redundancy: 'Triple-Redundancy Zero-Downtime Active',
    timestamp: new Date().toISOString(),
  });
}
