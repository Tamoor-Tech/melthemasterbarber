/* ==========================================================================
   PREMIUM AI CHATBOT JAVASCRIPT LOGIC - MEL THE MASTER BARBER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page context safely
    // --------------------------------------------------------------------------
    // 1. DYNAMIC INJECTION OF DOM STRUCTURE
    // --------------------------------------------------------------------------
    const chatbotHTML = `
      <!-- Floating Launcher Button -->
      <button class="mel-ai-launcher" id="melAiLauncher" aria-label="Open AI Assistant" title="Open AI Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M9 10h.01"></path>
          <path d="M15 10h.01"></path>
          <path d="M12 10h.01"></path>
        </svg>
      </button>
  
      <!-- Chat Panel -->
      <div class="mel-ai-panel" id="melAiPanel" role="dialog" aria-modal="true" aria-labelledby="melAiTitle">
        
        <!-- Header -->
        <div class="mel-ai-header">
          <div class="mel-ai-header-left">
            <div class="mel-ai-avatar">
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
              Hi! I'm Mel's AI Assistant. I can help you with services, pricing, booking, location, hours, and other questions about Mel The Master Barber. How can I help you?
              <div class="mel-ai-quick-actions" id="melAiQuickActions">
                <button class="mel-ai-quick-btn" data-query="Services & Pricing" aria-label="Ask about Services and Pricing">Services & Pricing</button>
                <button class="mel-ai-quick-btn" data-query="Book an Appointment" aria-label="Ask about Booking an Appointment">Book an Appointment</button>
                <button class="mel-ai-quick-btn" data-query="Location & Hours" aria-label="Ask about Location and Hours">Location & Hours</button>
                <button class="mel-ai-quick-btn" data-query="Contact Mel" aria-label="Ask about Contacting Mel">Contact Mel</button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Input Area -->
        <div class="mel-ai-input-wrapper">
          <input type="text" class="mel-ai-input" id="melAiInput" placeholder="Type your message..." autocomplete="off" aria-label="Type your message">
          <button class="mel-ai-send" id="melAiSend" aria-label="Send message" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
  
    // Append to body securely
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
  
    let chatHistory = [];
    let isWaitingForResponse = false;
  
    // --------------------------------------------------------------------------
    // 3. UI INTERACTIONS
    // --------------------------------------------------------------------------
    
    // Open Panel
    launcher.addEventListener('click', () => {
      panel.classList.add('active');
      launcher.classList.add('hidden');
      setTimeout(() => inputField.focus(), 300);
    });
  
    // Close Panel
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('active');
      launcher.classList.remove('hidden');
    });
  
    // Input state management (enable/disable send button)
    inputField.addEventListener('input', () => {
      if (inputField.value.trim().length > 0 && !isWaitingForResponse) {
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
      }
    });
  
    // Send message on ENTER key
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (inputField.value.trim() && !isWaitingForResponse) {
          handleUserMessage(inputField.value.trim());
        }
      }
    });
  
    // Send message on CLICK
    sendBtn.addEventListener('click', () => {
      if (inputField.value.trim() && !isWaitingForResponse) {
        handleUserMessage(inputField.value.trim());
      }
    });
  
    // Quick Actions Click Delegation
    if (quickActionContainer) {
      quickActionContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('mel-ai-quick-btn') && !isWaitingForResponse) {
          const query = e.target.getAttribute('data-query');
          // Hide quick actions visually slightly for clean UX or just send
          quickActionContainer.style.opacity = '0.5';
          quickActionContainer.style.pointerEvents = 'none';
          handleUserMessage(query);
        }
      });
    }
  
    // --------------------------------------------------------------------------
    // 4. CORE CHAT LOGIC
    // --------------------------------------------------------------------------
  
    async function handleUserMessage(message) {
      if (!message || isWaitingForResponse) return;
  
      // Update UI
      inputField.value = '';
      sendBtn.disabled = true;
      isWaitingForResponse = true;
  
      // Render user message
      appendMessage('user', message);
  
      // Update local history
      chatHistory.push({ role: 'user', parts: [{ text: message }] });
  
      // Render typing indicator
      const typingId = appendTypingIndicator();
      scrollToBottom();
  
      try {
        // Prepare payload with recent history (last 10 messages avoids payload bloat)
        const recentHistory = chatHistory.slice(-10);
        
        // Fetch from Vercel API Route or Local Node Server
        const isLocalLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:';
        const apiUrl = isLocalLocalhost ? 'http://localhost:3000/api/chat' : '/api/chat';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: recentHistory })
        });
  
        const data = await response.json();
  
        // Remove typing indicator
        removeMessage(typingId);
  
        if (response.ok && data.reply) {
          appendMessage('ai', parseMarkdownLinks(data.reply));
          chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
        } else {
          console.error("Chat API Error:", data);
          appendMessage('ai', "Sorry, I'm having trouble connecting right now. Please contact Mel directly at (770) 895-1392 or <a href='mailto:melcuts@gmail.com'>melcuts@gmail.com</a>.");
        }
  
      } catch (error) {
        console.error("Chat Network Error:", error);
        removeMessage(typingId);
        
        let errorMsg = "Sorry, I'm having trouble connecting right now. Please check your connection or contact Mel directly at (770) 895-1392.";
        if (isLocalLocalhost) {
          errorMsg = "Local testing error: The connection to the chatbot server failed. Please make sure that you are running <code>node server.js</code> in your terminal!";
        }
        appendMessage('ai', errorMsg);
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
    // 5. HELPER DOM FUNCTIONS
    // --------------------------------------------------------------------------
  
    function appendMessage(role, htmlContent) {
      const row = document.createElement('div');
      row.className = `mel-ai-msg-row ${role}`;
      row.innerHTML = `<div class="mel-ai-bubble">${htmlContent}</div>`;
      messagesContainer.appendChild(row);
      scrollToBottom();
    }
  
    function appendTypingIndicator() {
      const id = 'typing-' + Date.now();
      const row = document.createElement('div');
      row.className = 'mel-ai-msg-row ai';
      row.id = id;
      row.innerHTML = `
        <div class="mel-ai-bubble mel-ai-typing">
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
  
    // Utility to parse basic markdown links for the chat response if Gemini sends [Link Text](http...)
    function parseMarkdownLinks(text) {
      if (!text) return text;
      // Convert Markdown links [text](url) to HTML <a href="url" target="_blank">text</a>
      return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    }
  });
  
