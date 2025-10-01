# Gemini AI Chat Interface

A beautiful, responsive chat interface styled like Facebook Messenger, powered by Google's Gemini 2.5 Pro AI model.

## 🚀 One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Chat-UserInterface)

Click the button above to deploy this chat interface to Render instantly!

## Features

✨ **Modern Messenger-inspired Design**
- Clean, beautiful UI matching popular messaging apps
- Smooth animations and transitions
- Elegant chat bubbles with timestamps
- Professional gradient backgrounds

📱 **Fully Responsive**
- Mobile-first design approach
- No horizontal overflow on any device
- Adaptive layouts for phones, tablets, and desktops
- Touch-optimized interactions
- Landscape mode support

🤖 **Gemini AI Integration**
- Powered by Google's Gemini 2.5 Pro model
- Real-time AI responses
- Typing indicators for better UX
- Error handling and retry logic

🎨 **UI Components**
- User and AI avatars with status indicators
- Typing animation dots
- Clear chat functionality
- Message timestamps
- Smooth scroll behavior

## Getting Started

### Option 1: One-Click Deploy (Fastest! ⚡)

Click the "Deploy to Render" button above to deploy instantly to the cloud!

### Option 2: Local Installation

#### Prerequisites
- A modern web browser
- Internet connection for API calls
- The provided Gemini API key

#### Installation Steps

1. Clone or download this repository
   ```bash
   git clone https://github.com/JackkySpice/Chat-UserInterface.git
   cd Chat-UserInterface
   ```

2. Open `index.html` in your web browser
   ```bash
   # Using Python
   python3 -m http.server 8000
   # Then open http://localhost:8000
   
   # Or just double-click index.html
   ```

3. Start chatting with the AI!

No build process or dependencies required - just pure HTML, CSS, and vanilla JavaScript.

## File Structure

```
/
├── index.html      # Main HTML structure
├── style.css       # Messenger-inspired styling
├── script.js       # Gemini API integration & chat logic
└── README.md       # Documentation
```

## Usage

1. **Send a message**: Type in the input field and press Enter or click the send button
2. **Clear chat**: Click the trash icon in the header to clear conversation history
3. **View responses**: AI responses appear in gray bubbles on the left, your messages in blue on the right

## Technical Details

### API Configuration
- **Model**: Gemini 2.5 Pro
- **Endpoint**: `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`
- **API Key**: AIzaSyD2Oxjw65jnQ_oDFG8sc6DbrdWghygr6Cg

### Responsive Breakpoints
- Desktop: 900px max-width container
- Tablet: 768px and below
- Mobile: 480px and below
- Landscape: Special handling for low-height screens

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features Implemented

### Design
- ✅ Messenger-like gradient UI
- ✅ Avatar system with status indicators
- ✅ Chat bubbles with proper styling
- ✅ Smooth animations and transitions
- ✅ Professional color scheme

### Functionality
- ✅ Real-time AI chat
- ✅ Message history
- ✅ Typing indicators
- ✅ Clear chat option
- ✅ Timestamp display
- ✅ Error handling

### Responsiveness
- ✅ Mobile-optimized layout
- ✅ No horizontal overflow
- ✅ Touch-friendly buttons
- ✅ Adaptive text sizing
- ✅ Landscape mode support

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check the browser console for error messages.
