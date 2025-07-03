# Timer Usage in Cooking Chat

The cooking chat now supports timer functionality through AI tool calling! You can ask Mise to set timers for various cooking tasks, and the AI will intelligently extract timer information and create timers for you.

## How to Use

During a cooking session, you can naturally ask Mise to set timers in the chat. The AI will automatically detect timer requests and create timers for you.

### Example Timer Commands

- `"Set a timer for 5 minutes for the pasta"`
- `"Timer 10 minutes for the chicken breast"`
- `"15 minute timer for the rice"`
- `"Cook the sauce for 3 minutes"`
- `"Boil the water for 8 minutes"`
- `"Simmer the soup for 20 minutes"`
- `"Bake the cake for 45 minutes"`
- `"Roast the vegetables for 25 minutes"`

### How It Works

1. **Natural Language Processing**: The AI analyzes your message to detect timer requests
2. **Information Extraction**: Extracts duration and description from your request
3. **Timer Creation**: Creates a timer via the backend API
4. **Visual Feedback**: Timer appears in your cooking session interface
5. **Confirmation**: AI confirms the timer was created with details

### Timer Features

- **Start/Pause/Resume**: Control timer playback
- **Stop**: Stop and remove the timer
- **Reset**: Reset timer to original duration
- **Auto-complete**: Timer automatically removes itself when finished
- **Notifications**: Alert when timer completes
- **Multiple Timers**: Run several timers simultaneously

### Timer Display

Timers appear in the recipe session above the cooking chat. Each timer shows:
- Stage (current cooking step)
- Description (what the timer is for)
- Countdown display
- Control buttons

### Backend Integration

The timer system uses a proper API with the following endpoints:
- `POST /api/timer/create` - Create new timer
- `POST /api/timer/start` - Start timer
- `POST /api/timer/stop` - Stop timer
- `GET /api/timer/list` - Get all active timers
- `DELETE /api/timer/:id` - Delete timer

### AI Tool Calling

The chat uses intelligent pattern recognition to detect timer requests:
- Keywords: timer, set timer, cook for, boil for, simmer for, bake for, roast for
- Time patterns: X minutes, X minute timer
- Natural language: "How long should I cook this?"

### Integration

Timers are integrated with the cooking session context and will be cleared when the session ends. The system maintains timer state on the backend for reliability. 