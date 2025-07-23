# Piano AI Music Generator

A web application that generates piano music in MIDI format using the Magenta TensorFlow library with intelligent fallback system.

## Features

- **AI-Powered Music Generation**: Uses Magenta.js MusicRNN model with seed-based melody continuation
- **Algorithmic Fallback**: Reliable pentatonic melody generation when AI model fails to load
- **Interactive Controls**: Adjust creativity (temperature) and generation length (steps)
- **Real-time Playback**: Play generated music directly in the browser
- **MIDI Export**: Download generated music as MIDI files with proper timing
- **Visual Feedback**: Piano roll visualization of generated music

## Setup

1. Clone or download this project
2. Start a local web server:
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```
3. Open http://localhost:8000 in your web browser

## Usage

1. **Load the Application**: Open the web page - the app starts immediately with algorithmic generation while AI model loads in background
2. **Adjust Settings**:
   - **Temperature**: Controls creativity (0.1 = more predictable, 2.0 = more creative)
   - **Steps to Generate**: Controls melody length (16-128 steps)
3. **Generate Music**: Click "Generate Music" to create new piano melodies
   - Uses AI model if loaded, otherwise falls back to algorithmic generation
4. **Play Music**: Use the "Play" button to hear your generated music
5. **Download**: Click "Download MIDI" to save the music as a MIDI file

## Technical Details

- **AI Model**: Uses MusicRNN basic_rnn for seed-based melody continuation
- **Fallback System**: Algorithmic generation using pentatonic scales with temperature-based randomness
- **Frontend**: Vanilla JavaScript with HTML5 Canvas for visualization
- **Dependencies**: Magenta.js 1.21.0 and TensorFlow.js 3.21.0 (loaded via CDN)
- **Audio**: Web Audio API for playback
- **Export**: MIDI file generation with unquantized sequences for proper timing

## Architecture

**Dual Generation System:**
- **Primary**: MusicRNN model loads asynchronously and generates continuations from a 4-note seed (C-E-G-C)
- **Fallback**: Algorithmic generation creates pentatonic melodies when AI model fails or isn't loaded yet
- **MIDI Export**: Uses unquantized NoteSequence format to avoid timing issues in exported files

**Model Information:**
- MusicRNN `basic_rnn` checkpoint from Magenta
- Continuation-based generation using seed melodies
- Stable and reliable for consistent music generation

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: May require user interaction before audio playback

## Troubleshooting

- **Model Loading Issues**: If AI model fails to load, the app automatically uses algorithmic generation
- **Audio Playback**: Some browsers require user interaction before playing audio
- **MIDI Timing**: MIDI files export with proper sequential timing (fixed unquantized sequence format)
- **Performance**: AI model loads in background; app is immediately functional with algorithmic generation