# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm start
# or
python -m http.server 8000
```
Access the application at http://localhost:8000

**Alternative Ports:**
If port 8000 is occupied, use any available port:
```bash
python -m http.server 8001
python -m http.server 8002
```

## Architecture Overview

This is a client-side web application that generates piano music using AI and algorithmic approaches. The architecture implements a fallback system for reliable music generation.

### Core Architecture

**Single-Page Application Structure:**
- `index.html` - UI with controls for temperature, steps, and music playback
- `app.js` - Main application logic in a single `PianoMusicGenerator` class
- `style.css` - Responsive styling with gradient backgrounds and piano roll visualization

**Music Generation Pipeline:**
1. **Primary**: Attempts to load MusicRNN model from Magenta.js (`basic_rnn` checkpoint)
2. **Fallback**: Uses algorithmic generation with pentatonic scales if AI model fails
3. **Output**: Creates unquantized NoteSequence objects for proper MIDI export

### Key Components

**PianoMusicGenerator Class Methods:**
- `loadModel()` - Asynchronously loads MusicRNN in background
- `generateMusic()` - Tries AI first, falls back to algorithmic generation
- `generateAlgorithmicMusic()` - Creates pentatonic melodies with temperature-based randomness
- `validateSequenceForMIDI()` - Ensures sequences are unquantized and properly formatted
- `visualizeMusic()` - Renders piano roll on HTML5 canvas
- `downloadMIDI()` - Exports sequences using `mm.sequenceProtoToMidi()`

**Dependencies (CDN-loaded):**
- TensorFlow.js 3.21.0 
- Magenta.js 1.21.0
- Specific versions used to avoid compatibility issues

## Critical Technical Details

### MIDI Export Requirements
**Always create unquantized sequences** - quantized sequences cause a known Magenta.js bug where all notes play simultaneously in exported MIDI files. Required properties:
- `notes` with `pitch`, `startTime`, `endTime`, `velocity`
- `tempos` array with BPM information  
- `timeSignatures` for musical context
- `ticksPerQuarter` for MIDI resolution
- **Never include `quantizationInfo`** - this creates quantized sequences

### Model Loading Strategy
The application starts immediately with algorithmic generation, then tries to load the AI model in the background. This ensures users can generate music even if the AI model fails to load due to network issues or TensorFlow.js compatibility problems.

### Browser Compatibility
Uses Web Audio API for playback - some browsers require user interaction before audio plays. The canvas visualization works universally.

## File Structure Notes

- No build process required - pure client-side HTML/CSS/JS
- No test files or linting setup currently present
- Dependencies loaded via CDN, versions pinned for stability
- Single JavaScript file contains all application logic (~400 lines)