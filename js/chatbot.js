/* ==========================================================================
   PREMIUM AI CHATBOT JAVASCRIPT LOGIC - MEL THE MASTER BARBER
   ========================================================================== */

(function () {
  'use strict';

  function initChatbot() {
    // Prevent duplicate injection
    if (document.getElementById('melAiLauncher') || document.getElementById('melAiPanel')) {
      return;
    }

    // --------------------------------------------------------------------------
    // 1. DYNAMIC INJECTION OF DOM STRUCTURE
    // --------------------------------------------------------------------------
    const chatbotHTML = `
      <!-- Floating Launcher Button -->
      <button class="mel-ai-launcher" id="melAiLauncher" aria-label="Open Mel AI Assistant" title="Chat with Mel AI Assistant" aria-expanded="false" aria-controls="melAiPanel">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M9 10h.01"></path>
          <path d="M15 10h.01"></path>
          <path d="M12 10h.01"></path>
        </svg>
      </button>
  
      <!-- Chat Panel -->
      <div class="mel-ai-panel" id="melAiPanel" role="dialog" aria-modal="true" aria-labelledby="melAiTitle" aria-hidden="true">
        
        <!-- Header -->
        <div class="mel-ai-header">
          <div class="mel-ai-header-left">
            <div class="mel-ai-avatar" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"></path>
                <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div class="mel-ai-title-wrap">
              <h3 class="mel-ai-title" id="melAiTitle">MEL AI ASSISTANT</h3>
              <p class="mel-ai-subtitle">Your personal grooming assistant</p>
            </div>
          </div>
          <button class="mel-ai-close" id="melAiClose" aria-label="Close AI Assistant">&times;</button>
        </div>
  
        <!-- Messages Area -->
        <div class="mel-ai-messages" id="melAiMessages" role="log" aria-live="polite">
          <!-- Initial Welcome Message & Quick Actions -->
          <div class="mel-ai-msg-row ai">
            <div class="mel-ai-bubble">
              <p>Hi! I'm Mel's AI Assistant. I can help you with haircut services, beard treatments, pricing, packages, hair wash options, business hours, and booking an appointment.</p>
              <p>How can I help you today?</p>
              <div class="mel-ai-quick-actions" id="melAiQuickActions">
                <button class="mel-ai-quick-btn" data-query="What are your haircut prices?" aria-label="Ask about Haircut Prices">Haircut Prices</button>
                <button class="mel-ai-quick-btn" data-query="How much is Beard Treatment?" aria-label="Ask about Beard Treatment">Beard Treatment</button>
                <button class="mel-ai-quick-btn" data-query="How much is Haircut with Beard Treatment?" aria-label="Ask about Haircut with Beard Treatment">Haircut &amp; Beard Treatment</button>
                <button class="mel-ai-quick-btn" data-query="Do you offer hair wash?" aria-label="Ask about Hair Wash">Hair Wash Options</button>
                <button class="mel-ai-quick-btn" data-query="What is your business address and hours?" aria-label="Ask about Location and Hours">Hours &amp; Location</button>
                <button class="mel-ai-quick-btn" data-query="How can I book an appointment?" aria-label="Ask about Booking an Appointment">Book Appointment</button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Input Area -->
        <div class="mel-ai-input-wrapper">
          <input type="text" class="mel-ai-input" id="melAiInput" placeholder="Type your message..." autocomplete="off" aria-label="Type your message">
          <button class="mel-ai-send" id="melAiSend" aria-label="Send message" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // --------------------------------------------------------------------------
    // 2. STATE & ELEMENT REFERENCES
    // --------------------------------------------------------------------------
    const launcher = document.getElementById('melAiLauncher');
    const panel = document.getElementById('melAiPanel');
    const closeBtn = document.getElementById('melAiClose');
    const inputField = document.getElementById('melAiInput');
    const sendBtn = document.getElementById('melAiSend');
    const messagesContainer = document.getElementById('melAiMessages');
    const quickActionContainer = document.getElementById('melAiQuickActions');

    const chatHistory = [];
    let isWaitingForResponse = false;

    // --------------------------------------------------------------------------
    // 3. UI INTERACTIONS & ACCESSIBILITY
    // --------------------------------------------------------------------------

    function openChat() {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
      launcher.classList.add('hidden');
      launcher.setAttribute('aria-expanded', 'true');
      setTimeout(() => {
        inputField.focus();
      }, 300);
    }

    function closeChat() {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
      launcher.classList.remove('hidden');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }

    // Open on launcher click
    launcher.addEventListener('click', openChat);

    // Close on close button click
    closeBtn.addEventListener('click', closeChat);

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('active')) {
        closeChat();
      }
    });

    // Input state management (enable/disable send button)
    inputField.addEventListener('input', () => {
      if (inputField.value.trim().length > 0 && !isWaitingForResponse) {
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
      }
    });

    // Send message on Enter key (without Shift)
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = inputField.value.trim();
        if (text && !isWaitingForResponse) {
          handleUserMessage(text);
        }
      }
    });

    // Send message on button click
    sendBtn.addEventListener('click', () => {
      const text = inputField.value.trim();
      if (text && !isWaitingForResponse) {
        handleUserMessage(text);
      }
    });

    // Quick Actions Click Delegation
    if (quickActionContainer) {
      quickActionContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.mel-ai-quick-btn');
        if (btn && !isWaitingForResponse) {
          const query = btn.getAttribute('data-query');
          if (query) {
            handleUserMessage(query);
          }
        }
      });
    }

    // --------------------------------------------------------------------------
    // 4. CORE CHAT LOGIC
    // --------------------------------------------------------------------------

    function resolveApiUrl() {
      // 1. If file protocol, use local server
      if (window.location.protocol === 'file:') {
        return 'http://localhost:3000/api/chat';
      }
      // 2. If running on localhost / 127.0.0.1
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // If already on port 3000, use relative path
        if (window.location.port === '3000') {
          return '/api/chat';
        }
        // Otherwise (e.g. Live Server on 5500 or 8080), route to local node server on 3000
        return 'http://localhost:3000/api/chat';
      }
      // 3. In production (Vercel, custom domain, etc.)
      return '/api/chat';
    }

    async function handleUserMessage(message) {
      if (!message || isWaitingForResponse) return;

      // Update UI state
      inputField.value = '';
      sendBtn.disabled = true;
      isWaitingForResponse = true;

      // Render user message safely
      appendUserMessage(message);

      // Save to conversation history
      chatHistory.push({ role: 'user', parts: [{ text: message }] });

      // Render typing indicator
      const typingId = appendTypingIndicator();
      scrollToBottom();

      try {
        const recentHistory = chatHistory.slice(-10);
        const apiUrl = resolveApiUrl();

        // 25 second timeout safeguard
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: recentHistory }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        // Remove typing indicator
        removeMessage(typingId);

        if (response.ok && data && data.reply) {
          appendAiMessage(data.reply);
          chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
        } else {
          console.error('Chat API Error Response:', data);
          const fallback = "I'm having trouble retrieving that information right now. You can book an appointment directly through our [Square Booking Page](https://mel-the-master-barber.square.site/) or contact Mel directly at (770) 895-1392 or melcuts@gmail.com.";
          appendAiMessage(fallback);
        }

      } catch (error) {
        console.error('Chat Network / Connectivity Error:', error);
        removeMessage(typingId);

        let errorText = "I'm having trouble connecting to the server. You can book an appointment directly at [Square Online Booking](https://mel-the-master-barber.square.site/) or contact Mel directly at (770) 895-1392.";
        if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          errorText += " *(Tip: Make sure `node server.js` is running on port 3000).*";
        }
        appendAiMessage(errorText);
      } finally {
        isWaitingForResponse = false;
        if (inputField.value.trim().length > 0) {
          sendBtn.disabled = false;
        }
        inputField.focus();
        scrollToBottom();
      }
    }

    // --------------------------------------------------------------------------
    // 5. HELPER DOM & FORMATTING FUNCTIONS
    // --------------------------------------------------------------------------

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function formatMarkdown(text) {
      if (!text) return '';

      // 1. Convert markdown links [text](url)
      let formatted = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

      // 2. Convert raw URLs not already inside an anchor tag
      formatted = formatted.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

      // 3. Bold text **text**
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // 4. Split lines into paragraphs and list items
      const lines = formatted.split('\n');
      let inList = false;
      let resultHtml = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          if (inList) {
            resultHtml += '</ul>';
            inList = false;
          }
          continue;
        }

        const listMatch = line.match(/^[\*\-]\s+(.*)$/);
        if (listMatch) {
          if (!inList) {
            resultHtml += '<ul>';
            inList = true;
          }
          resultHtml += `<li>${listMatch[1]}</li>`;
        } else {
          if (inList) {
            resultHtml += '</ul>';
            inList = false;
          }
          resultHtml += `<p>${line}</p>`;
        }
      }

      if (inList) {
        resultHtml += '</ul>';
      }

      return resultHtml;
    }

    function appendUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'mel-ai-msg-row user';
      const bubble = document.createElement('div');
      bubble.className = 'mel-ai-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);
      messagesContainer.appendChild(row);
      scrollToBottom();
    }

    function appendAiMessage(rawText) {
      const row = document.createElement('div');
      row.className = 'mel-ai-msg-row ai';
      const bubble = document.createElement('div');
      bubble.className = 'mel-ai-bubble';
      bubble.innerHTML = formatMarkdown(rawText);
      row.appendChild(bubble);
      messagesContainer.appendChild(row);
      scrollToBottom();
    }

    function appendTypingIndicator() {
      const id = 'typing-' + Date.now();
      const row = document.createElement('div');
      row.className = 'mel-ai-msg-row ai';
      row.id = id;
      row.innerHTML = `
        <div class="mel-ai-bubble mel-ai-typing" role="status" aria-label="Mel AI is typing...">
          <div class="mel-ai-dot"></div>
          <div class="mel-ai-dot"></div>
          <div class="mel-ai-dot"></div>
        </div>
      `;
      messagesContainer.appendChild(row);
      return id;
    }

    function removeMessage(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function scrollToBottom() {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  }

  // Safe startup whether DOM is already loaded or still loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
