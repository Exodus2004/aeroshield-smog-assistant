import { h } from 'preact';
import { useState } from 'preact/hooks';
import { sendChatMessage } from '../services/api.js';

export function ChatAdvisor({ currentAqi, vulnerability }) {
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
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async queryText => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend, currentAqi, vulnerability);
      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        takeaway: response.actionable_takeaway,
        chips: response.suggested_quick_chips || [],
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
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const latestAssistant = messages.slice().reverse().find(m => m.role === 'assistant');

  return (
    <div className="tab-pane" role="tabpanel" id="pane-chat" aria-labelledby="tab-chat">
      <div className="section-title-wrap">
        <h3 className="pane-title">💬 Interactive GenAI Clean Air Planning Consultant</h3>
        <p className="section-desc">
          Receive personalized scientific advice on particle infiltration, DIY air filtration engineering, and safe daily routine timing.
        </p>
      </div>

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
