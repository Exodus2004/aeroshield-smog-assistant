/**
 * API Service Layer with Triple-Redundancy Fallback
 */

import { calculateLocalSmogPlan, calculateLocalChatReply } from './resilientEngine.js';

const REQUEST_TIMEOUT_MS = 3500;

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function generateSmogPlan(formData) {
  try {
    const response = await fetchWithTimeout('/api/v1/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[AeroShield Resilience] Network/API unavailable, activating client-side engine <5ms:', err);
    return calculateLocalSmogPlan(formData);
  }
}

export async function sendChatMessage(query, aqi = 250, vulnerability = 'GENERAL_HOUSEHOLD') {
  try {
    const response = await fetchWithTimeout('/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: query,
        current_aqi: Number(aqi) || 250,
        vulnerability: vulnerability || 'GENERAL_HOUSEHOLD',
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[AeroShield Resilience] Chat API offline, activating resilient consultant:', err);
    return calculateLocalChatReply(query, aqi);
  }
}
