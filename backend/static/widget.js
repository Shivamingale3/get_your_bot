(function() {
  'use strict';

  var script = document.currentScript;
  var botId = script ? script.getAttribute('data-bot-id') : null;
  var apiBase = script ? script.getAttribute('data-api-base') || 'http://localhost:3001' : 'http://localhost:3001';
  var themeColor = script ? script.getAttribute('data-theme') || '#6366f1' : '#6366f1';

  if (!botId) {
    console.error('GetYourBot: data-bot-id is required');
    return;
  }

  var widgetId = 'gyb-widget-' + botId;
  var isOpen = false;

  function createWidget() {
    var styles = document.createElement('style');
    styles.textContent = [
      '#' + widgetId + ' * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }',
      '#' + widgetId + '-container { position: fixed; bottom: 20px; right: 20px; z-index: 999999; width: 380px; max-height: 600px; display: flex; flex-direction: column; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden; opacity: 0; transform: translateY(20px) scale(0.95); transition: all 0.3s ease; pointer-events: none; }',
      '#' + widgetId + '-container.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }',
      '#' + widgetId + '-header { background: ' + themeColor + '; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; font-weight: 600; }',
      '#' + widgetId + '-close { background: none; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; padding: 0; }',
      '#' + widgetId + '-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 300px; }',
      '#' + widgetId + '-message { max-width: 80%; padding: 12px 16px; border-radius: 16px; line-height: 1.4; font-size: 14px; }',
      '#' + widgetId + '-message.bot { background: #f1f5f9; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; }',
      '#' + widgetId + '-message.user { background: ' + themeColor + '; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }',
      '#' + widgetId + '-input-wrap { padding: 12px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }',
      '#' + widgetId + '-input { flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 24px; outline: none; font-size: 14px; }',
      '#' + widgetId + '-input:focus { border-color: ' + themeColor + '; }',
      '#' + widgetId + '-send { background: ' + themeColor + '; color: white; border: none; padding: 12px 20px; border-radius: 24px; cursor: pointer; font-weight: 600; }',
      '#' + widgetId + '-send:hover { opacity: 0.9; }',
      '#' + widgetId + '-send:disabled { opacity: 0.5; cursor: not-allowed; }',
      '#' + widgetId + '-toggle { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: ' + themeColor + '; color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-size: 28px; display: flex; align-items: center; justify-content: center; z-index: 999998; transition: transform 0.2s; }',
      '#' + widgetId + '-toggle:hover { transform: scale(1.1); }',
      '#' + widgetId + '-toggle.hidden { display: none; }',
      '#' + widgetId + '-loading { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: ' + widgetId + '-spin 0.8s linear infinite; }',
      '@keyframes ' + widgetId + '-spin { to { transform: rotate(360deg); } }'
    ].join('');
    document.head.appendChild(styles);

    var container = document.createElement('div');
    container.id = widgetId + '-container';
    container.innerHTML = [
      '<div id="' + widgetId + '-header">',
        '<span>Chat Assistant</span>',
        '<button id="' + widgetId + '-close">&times;</button>',
      '</div>',
      '<div id="' + widgetId + '-messages"></div>',
      '<div id="' + widgetId + '-input-wrap">',
        '<input type="text" id="' + widgetId + '-input" placeholder="Type a message..." />',
        '<button id="' + widgetId + '-send">Send</button>',
      '</div>'
    ].join('');
    document.body.appendChild(container);

    var toggle = document.createElement('button');
    toggle.id = widgetId + '-toggle';
    toggle.innerHTML = '&#9997;';
    toggle.title = 'Open Chat';
    document.body.appendChild(toggle);

    var messagesEl = document.getElementById(widgetId + '-messages');
    var inputEl = document.getElementById(widgetId + '-input');
    var sendBtn = document.getElementById(widgetId + '-send');
    var closeBtn = document.getElementById(widgetId + '-close');

    function addMessage(text, type) {
      var msg = document.createElement('div');
      msg.className = widgetId + '-message ' + type;
      msg.textContent = text;
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setLoading(loading) {
      sendBtn.disabled = loading;
      sendBtn.innerHTML = loading ? '<span class="' + widgetId + '-loading"></span>' : 'Send';
    }

    function sendMessage() {
      var text = inputEl.value.trim();
      if (!text || sendBtn.disabled) return;

      addMessage(text, 'user');
      inputEl.value = '';
      setLoading(true);

      fetch(apiBase + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: botId, message: text })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLoading(false);
        if (data.response) {
          addMessage(data.response, 'bot');
        } else if (data.error) {
          addMessage('Error: ' + data.error, 'bot');
        }
      })
      .catch(function(err) {
        setLoading(false);
        addMessage('Sorry, something went wrong.', 'bot');
      });
    }

    function toggleChat() {
      isOpen = !isOpen;
      container.classList.toggle('open', isOpen);
      toggle.classList.toggle('hidden', isOpen);
      if (isOpen && messagesEl.children.length === 0) {
        addMessage('Hi! How can I help you today?', 'bot');
      }
    }

    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
