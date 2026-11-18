import { h } from 'preact';
import { useState } from 'preact/hooks';
import { sendChatMessage } from '../services/api.js';

export function ChatAdvisor({ currentAqi, vulnerability }) {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('aeroshield_gemini_key') || '';
    } catch {
      return '';
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        `Hello! I am your AeroShield AI Clean Air Consultant. Current ambient AQI is ${currentAqi}.\n` +
        'Ask me anything about DIY air cleaner construction, thermal inversion timing, green school commutes, or safe home ventilation.',
      takeaway: 'Run indoor filtration in occupied bedrooms and keep windows sealed during morning inversions.',
      chips: [
        'How do I build a DIY Corsi-Rosenthal box under $35?',
        'When is the safest time to ventilate today?',
        'How to protect kids during the morning school run?',
        'Cooking ventilation tips to prevent indoor PM2.5 spikes',
      ],
      model: 'AeroShield Resilient Engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeySave = val => {
    setApiKey(val);
    try {
      localStorage.setItem('aeroshield_gemini_key', val);
    } catch (e) {
      console.warn('Could not save API key to localStorage', e);
    }
  };

  const handleSend = async queryText => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend, currentAqi, vulnerability, apiKey);
      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        takeaway: response.actionable_takeaway,
        chips: response.suggested_quick_chips || [],
        model: response.model_used || (apiKey ? 'Google Gemini 1.5 Flash' : 'AeroShield Resilient Engine'),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Keep indoor air filtration running and windows sealed during morning and evening inversions.',
          takeaway: 'Focus on indoor room filtration and sealing perimeter drafts.',
          chips: ['How do I build a DIY Corsi-Rosenthal box?'],
          model: 'AeroShield Resilient Engine',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const latestAssistant = messages.slice().reverse().find(m => m.role === 'assistant');

  return (
    <div className="tab-pane" role="tabpanel" id="pane-chat" aria-labelledby="tab-chat">
      <div className="section-title-wrap chat-title-wrap">
        <div>
          <h3 className="pane-title">💬 Interactive GenAI Clean Air Planning Consultant</h3>
          <p className="section-desc">
            Receive personalized scientific advice on particle infiltration, DIY air filtration engineering, and safe daily routine timing.
          </p>
        </div>

        <div className="api-key-toggle-area">
          <button
            type="button"
            className="api-key-toggle-btn"
            onClick={() => setShowKeyInput(!showKeyInput)}
            aria-expanded={showKeyInput}
            aria-label="Toggle Gemini API Key settings"
          >
            {apiKey ? '🔑 Gemini API Key Connected' : '🔑 Custom API Key (Optional)'}
          </button>
        </div>
      </div>

      {showKeyInput && (
        <div className="api-key-input-card">
          <label htmlFor="gemini-key" className="form-label">
            Google Gemini API Key (Optional):
          </label>
          <div className="api-key-input-row">
            <input
              id="gemini-key"
              type="password"
              className="form-input"
              placeholder="Paste AI Studio API key (AIzaSy...)..."
              value={apiKey}
              onInput={e => handleKeySave(e.target.value)}
            />
            {apiKey && (
              <button
                type="button"
                className="clear-key-btn"
                onClick={() => handleKeySave('')}
                aria-label="Clear API key"
              >
                Clear
              </button>
            )}
          </div>
          <small className="api-key-help">
            If left blank, AeroShield runs on its built-in, zero-downtime scientific heuristic engine (under 5ms).
          </small>
        </div>
      )}

      {latestAssistant && latestAssistant.takeaway && (
        <div className="actionable-takeaway-banner" role="alert">
          <span className="banner-icon" aria-hidden="true">
            ⚡
          </span>
          <div>
            <strong>Immediate Action Item:</strong> {latestAssistant.takeaway}
          </div>
        </div>
      )}

      {latestAssistant && latestAssistant.chips && latestAssistant.chips.length > 0 && (
        <div className="quick-chips-wrapper" aria-label="Suggested quick prompt inquiries">
          <span className="chips-label">Quick Prompts:</span>
          <div className="chips-list">
            {latestAssistant.chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => handleSend(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages-container" role="log" aria-live="polite">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message ${m.role === 'user' ? 'msg-user' : 'msg-assistant'}`}>
            <div className="msg-header">
              <span className="msg-role">{m.role === 'user' ? '👤 You' : '🛡️ AeroShield AI'}</span>
              {m.model && <span className="msg-model-tag">{m.model}</span>}
            </div>
            <div className="msg-body">
              {m.content.split('\n').map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message msg-assistant">
            <div className="msg-header">
              <span className="msg-role">🛡️ AeroShield AI</span>
            </div>
            <div className="msg-body">
              <p className="loading-dots">Consulting atmospheric physics and health guidelines...</p>
            </div>
          </div>
        )}
      </div>

      <form
        className="chat-input-form"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about smog mitigation:
        </label>
        <input
          id="chat-input"
          type="text"
          className="chat-input"
          placeholder="Ask a question (e.g. 'How do I build a Corsi-Rosenthal box under $35?')..."
          value={input}
          onInput={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
          Send Inquire ➔
        </button>
      </form>
    </div>
  );
}
