# Piano AI Music Generator

A web application that generates piano music in MIDI format using the Magenta TensorFlow library.

## Features

- **AI-Powered Music Generation**: Uses Magenta.js MusicVAE model for creating original piano melodies
- **Interactive Controls**: Adjust creativity (temperature) and number of samples
- **Real-time Playback**: Play generated music directly in the browser
- **MIDI Export**: Download generated music as MIDI files
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

1. **Load the Application**: Open the web page and wait for the AI model to load
2. **Adjust Settings**:
   - **Temperature**: Controls creativity (0.1 = more predictable, 2.0 = more creative)
   - **Number of Samples**: Generate 1-5 different musical variations
3. **Generate Music**: Click "Generate Music" to create new piano melodies
4. **Play Music**: Use the "Play" button to hear your generated music
5. **Download**: Click "Download MIDI" to save the music as a MIDI file

## Technical Details

- **Model**: Uses MusicVAE mel_4bar_med_lokl_q2 for 4-bar melody generation
- **Frontend**: Vanilla JavaScript with HTML5 Canvas for visualization
- **Dependencies**: Magenta.js and TensorFlow.js (loaded via CDN)
- **Audio**: Web Audio API for playback
- **Export**: MIDI file generation and download

## Model Information

The application uses the `mel_4bar_med_lokl_q2` checkpoint from Magenta:
- A medium-sized 4-bar, 90-class onehot melody model
- Trained with a strong prior for better sampling quality
- Optimized for creative music generation

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: May require user interaction before audio playback

## Troubleshooting

- **Model Loading Issues**: Ensure stable internet connection for downloading the AI model
- **Audio Playback**: Some browsers require user interaction before playing audio
- **Performance**: Large models may take time to load on slower connections