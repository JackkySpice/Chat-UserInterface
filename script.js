// Gemini API Configuration
const API_KEY = 'AIzaSyD2Oxjw65jnQ_oDFG8sc6DbrdWghygr6Cg';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;
const STREAM_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?alt=sse&key=${API_KEY}`;

// DOM Elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const typingIndicator = document.getElementById('typingIndicator');
const sendButton = document.getElementById('sendButton');
const clearChatButton = document.getElementById('clearChat');

// Chat history for context
let chatHistory = [];

// Streaming control
let streamController = null;
let isStreaming = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageForm.addEventListener('submit', handleSubmit);
    clearChatButton.addEventListener('click', clearChat);
    messageInput.addEventListener('input', handleInputChange);
    
    // Focus input on load
    messageInput.focus();
    
    // Initialize scroll to bottom button
    initScrollButton();
    
    // Add suggestion click handlers
    initPromptSuggestions();
});

// Handle input changes
function handleInputChange() {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.disabled = !hasText && !isStreaming;
    
    // Update character counter
    updateCharacterCounter();
}

// Update character counter
function updateCharacterCounter() {
    const counter = document.getElementById('charCounter');
    if (!counter) return;
    
    const length = messageInput.value.length;
    const maxLength = 2000;
    const remaining = maxLength - length;
    
    counter.textContent = `${remaining}`;
    
    if (remaining < 100) {
        counter.style.color = '#c33';
    } else if (remaining < 300) {
        counter.style.color = '#f90';
    } else {
        counter.style.color = 'var(--text-secondary)';
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // If streaming, stop it
    if (isStreaming) {
        stopGeneration();
        return;
    }
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    updateCharacterCounter();
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Change send button to stop button
    updateSendButton(true);
    
    try {
        // Send to Gemini API (non-streaming for instant complete response)
        await sendToGemini(message);
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            hideTypingIndicator();
            console.error('Error:', error);
            showError('Sorry, I encountered an error. Please try again.', message);
        }
    } finally {
        updateSendButton(false);
    }
    
    // Don't automatically refocus input to prevent keyboard from appearing
    // User can tap/click the input manually when ready
}

// Send message to Gemini API (non-streaming - shows complete response instantly)
async function sendToGemini(message) {
    try {
        // Create abort controller for this request
        streamController = new AbortController();
        isStreaming = true;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            }),
            signal: streamController.signal
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Extract the response text
        let responseText = '';
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                responseText = candidate.content.parts[0].text;
            }
        }
        
        if (!responseText) {
            throw new Error('No response from API');
        }
        
        // Create and display AI message bubble with complete response
        const aiMessageDiv = createAIMessageBubble();
        const messageBubble = aiMessageDiv.querySelector('.message-bubble');
        
        // Display the complete formatted response instantly
        messageBubble.innerHTML = formatAIResponse(responseText);
        
        // Add copy button to the message
        addCopyButton(aiMessageDiv);
        
        // Add to chat history
        const time = aiMessageDiv.querySelector('.message-time').textContent;
        chatHistory.push({ role: 'ai', text: responseText, time: time });
        
        // Scroll to show the complete message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    } finally {
        isStreaming = false;
        streamController = null;
    }
}

// Create AI message bubble (for streaming)
function createAIMessageBubble() {
    // Remove welcome message if it exists
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-bubble"></div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    return messageDiv;
}

// Add message to chat (for user messages)
function addMessage(text, sender) {
    // Remove welcome message if it exists
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Add to chat history
        chatHistory.push({ role: sender, text: text, time: time });
    }
}

// Format AI response (convert markdown-like syntax to HTML)
function formatAIResponse(text) {
    let formatted = escapeHtml(text);
    
    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    formatted = formatted.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.classList.add('active');
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.remove('active');
}

// Scroll to bottom of messages
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Show error message
function showError(message, originalMessage = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <span>${message}</span>
        ${originalMessage ? `<button class="retry-button" onclick="retryMessage('${escapeHtml(originalMessage).replace(/'/g, "\\'")}')">Retry</button>` : ''}
    `;
    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
    
    // Remove error after 8 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 8000);
}

// Retry failed message
function retryMessage(message) {
    messageInput.value = message;
    handleInputChange();
    messageInput.focus();
}

// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the chat?')) {
        chatHistory = [];
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    </svg>
                </div>
                <h2>Welcome to Gemini Chat!</h2>
                <p>I'm your AI assistant powered by Google's Gemini 2.5 Pro. Ask me anything!</p>
                
                <div class="suggestions-container">
                    <button class="suggestion-chip">Explain quantum computing</button>
                    <button class="suggestion-chip">Write a Python function</button>
                    <button class="suggestion-chip">Plan a trip to Japan</button>
                    <button class="suggestion-chip">Help me debug code</button>
                </div>
            </div>
        `;
        // Re-initialize suggestion handlers
        initPromptSuggestions();
    }
}

// Handle Enter key to send message
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (messageInput.value.trim()) {
            handleSubmit(e);
        }
    }
});

// Stop generation
function stopGeneration() {
    if (streamController) {
        streamController.abort();
        isStreaming = false;
        hideTypingIndicator();
        updateSendButton(false);
        
        // Add stopped message indicator
        const lastMessage = messagesContainer.querySelector('.message.ai:last-of-type');
        if (lastMessage) {
            const bubble = lastMessage.querySelector('.message-bubble');
            bubble.classList.remove('streaming');
            bubble.innerHTML += '<em style="color: var(--text-secondary); display: block; margin-top: 8px; font-size: 12px;">Generation stopped</em>';
            addCopyButton(lastMessage);
        }
    }
}

// Update send button appearance
function updateSendButton(streaming) {
    const sendButton = document.getElementById('sendButton');
    if (streaming) {
        sendButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
        `;
        sendButton.title = 'Stop generation';
        sendButton.disabled = false;
    } else {
        sendButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
        `;
        sendButton.title = 'Send message';
        sendButton.disabled = !messageInput.value.trim();
    }
}

// Add copy button to message
function addCopyButton(messageDiv) {
    const messageContent = messageDiv.querySelector('.message-content');
    const bubble = messageDiv.querySelector('.message-bubble');
    
    // Don't add if already exists
    if (messageContent.querySelector('.copy-button')) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-button';
    copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
    `;
    copyBtn.title = 'Copy message';
    copyBtn.onclick = () => copyToClipboard(bubble.textContent, copyBtn);
    
    messageContent.appendChild(copyBtn);
}

// Copy to clipboard
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
        button.style.color = '#31a24c';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize scroll to bottom button
function initScrollButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToBottomBtn';
    scrollBtn.className = 'scroll-to-bottom';
    scrollBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
    `;
    scrollBtn.onclick = () => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    };
    
    document.querySelector('.chat-container').appendChild(scrollBtn);
    
    // Show/hide based on scroll position
    messagesContainer.addEventListener('scroll', () => {
        const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
        scrollBtn.classList.toggle('visible', !isNearBottom && messagesContainer.scrollHeight > messagesContainer.clientHeight);
    });
}

// Initialize prompt suggestions
function initPromptSuggestions() {
    const suggestions = document.querySelectorAll('.suggestion-chip');
    suggestions.forEach(chip => {
        chip.addEventListener('click', () => {
            messageInput.value = chip.textContent;
            handleInputChange();
            messageInput.focus();
        });
    });
}

// Prevent zoom on iOS when focusing input
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}
