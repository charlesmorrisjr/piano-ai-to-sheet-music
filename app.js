class PianoMusicGenerator {
    constructor() {
        this.model = null;
        this.player = null;
        this.generatedSequence = null;
        this.isPlaying = false;
        
        this.initializeUI();
        this.createFallbackMusic();
    }

    initializeUI() {
        this.temperatureSlider = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperature-value');
        this.stepsSlider = document.getElementById('steps');
        this.stepsValue = document.getElementById('steps-value');
        
        this.generateBtn = document.getElementById('generate-btn');
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        this.successDiv = document.getElementById('success');
        
        this.canvas = document.getElementById('piano-roll');
        this.ctx = this.canvas.getContext('2d');

        this.temperatureSlider.addEventListener('input', (e) => {
            this.temperatureValue.textContent = e.target.value;
        });

        this.stepsSlider.addEventListener('input', (e) => {
            this.stepsValue.textContent = e.target.value;
        });

        this.generateBtn.addEventListener('click', () => this.generateMusic());
        this.playBtn.addEventListener('click', () => this.playMusic());
        this.stopBtn.addEventListener('click', () => this.stopMusic());
        this.downloadBtn.addEventListener('click', () => this.downloadMIDI());
    }

    createFallbackMusic() {
        try {
            this.player = new mm.Player();
            this.showStatus('success', 'Ready to generate music!');
            this.generateBtn.disabled = false;
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Error initializing player:', error);
            this.showStatus('error', 'Failed to initialize audio player.');
        }
    }

    async loadModel() {
        try {
            this.showStatus('loading', 'Loading AI model...');
            
            this.model = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
            await this.model.initialize();
            
            this.showStatus('success', 'AI model loaded successfully!');
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Error loading model:', error);
            this.showStatus('error', 'AI model failed to load. Using algorithmic generation instead.');
        }
    }

    async generateMusic() {
        try {
            this.generateBtn.disabled = true;
            this.showStatus('loading', 'Generating music...');

            const temperature = parseFloat(this.temperatureSlider.value);
            const steps = parseInt(this.stepsSlider.value);

            if (this.model) {
                // Try AI generation first
                try {
                    const seed = {
                        notes: [
                            { pitch: 60, startTime: 0.0, endTime: 0.5 },
                            { pitch: 64, startTime: 0.5, endTime: 1.0 },
                            { pitch: 67, startTime: 1.0, endTime: 1.5 },
                            { pitch: 72, startTime: 1.5, endTime: 2.0 }
                        ],
                        totalTime: 2.0,
                        quantizationInfo: { stepsPerQuarter: 4 }
                    };

                    this.generatedSequence = await this.model.continueSequence(seed, steps, temperature);
                } catch (aiError) {
                    console.warn('AI generation failed, falling back to algorithmic:', aiError);
                    this.generatedSequence = this.generateAlgorithmicMusic(temperature, steps);
                }
            } else {
                // Use algorithmic generation as fallback
                this.generatedSequence = this.generateAlgorithmicMusic(temperature, steps);
            }
            
            if (this.generatedSequence && this.generatedSequence.notes && this.generatedSequence.notes.length > 0) {
                if (!this.generatedSequence.totalTime) {
                    this.generatedSequence.totalTime = Math.max(...this.generatedSequence.notes.map(n => n.endTime));
                }
                
                // Ensure AI-generated sequences also have proper MIDI metadata
                this.validateSequenceForMIDI(this.generatedSequence);
                
                this.visualizeMusic(this.generatedSequence);
                this.showStatus('success', 'Music generated successfully!');
                
                this.playBtn.disabled = false;
                this.downloadBtn.disabled = false;
            } else {
                this.showStatus('error', 'Failed to generate music.');
            }
            
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Error generating music:', error);
            this.showStatus('error', `Failed to generate music: ${error.message}`);
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    generateAlgorithmicMusic(temperature, steps) {
        const notes = [];
        const scales = {
            c_major: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84],
            pentatonic: [60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84]
        };
        
        const scale = scales.pentatonic;
        let currentTime = 0;
        const noteDuration = 0.5;
        const randomness = Math.min(Math.max(temperature, 0.1), 2.0);
        
        // Define proper quantization and tempo for MIDI export
        const stepsPerQuarter = 4;
        const qpm = 120; // quarters per minute (tempo)
        
        // Generate seed notes
        const seedNotes = [60, 64, 67, 72];
        seedNotes.forEach((pitch, i) => {
            notes.push({
                pitch: pitch,
                startTime: i * noteDuration,
                endTime: (i + 1) * noteDuration,
                velocity: 80
            });
        });
        
        currentTime = seedNotes.length * noteDuration;
        
        // Generate continuation
        for (let i = 0; i < steps; i++) {
            const lastPitch = notes[notes.length - 1].pitch;
            const scaleIndex = scale.indexOf(lastPitch) || 0;
            
            // Choose next note based on temperature
            let nextIndex;
            if (Math.random() < 0.3 / randomness) {
                // Stay on same note
                nextIndex = scaleIndex;
            } else if (Math.random() < 0.5) {
                // Move up or down by 1-2 steps
                const direction = Math.random() < 0.5 ? -1 : 1;
                const steps = Math.floor(Math.random() * 2 * randomness) + 1;
                nextIndex = Math.max(0, Math.min(scale.length - 1, scaleIndex + direction * steps));
            } else {
                // Random jump
                nextIndex = Math.floor(Math.random() * scale.length);
            }
            
            const pitch = scale[nextIndex];
            const velocity = 60 + Math.random() * 40;
            const duration = noteDuration * (0.5 + Math.random() * randomness);
            
            notes.push({
                pitch: pitch,
                startTime: currentTime,
                endTime: currentTime + duration,
                velocity: Math.floor(velocity)
            });
            
            currentTime += duration;
        }
        
        // Create a properly structured unquantized NoteSequence for MIDI export
        return {
            notes: notes,
            totalTime: currentTime,
            ticksPerQuarter: 220, // Standard MIDI resolution
            tempos: [{
                time: 0,
                qpm: qpm
            }],
            timeSignatures: [{
                time: 0,
                numerator: 4,
                denominator: 4
            }]
        };
    }

    async playMusic() {
        if (!this.generatedSequence || !this.player) {
            this.showStatus('error', 'No music to play. Generate some music first!');
            return;
        }

        try {
            if (this.isPlaying) {
                this.player.stop();
                this.isPlaying = false;
                this.playBtn.textContent = 'Play';
                this.stopBtn.disabled = true;
                return;
            }

            this.isPlaying = true;
            this.playBtn.textContent = 'Pause';
            this.stopBtn.disabled = false;

            await this.player.start(this.generatedSequence);
            
            this.isPlaying = false;
            this.playBtn.textContent = 'Play';
            this.stopBtn.disabled = true;
        } catch (error) {
            console.error('Error playing music:', error);
            this.showStatus('error', 'Failed to play music.');
            this.isPlaying = false;
            this.playBtn.textContent = 'Play';
            this.stopBtn.disabled = true;
        }
    }

    stopMusic() {
        if (this.player && this.isPlaying) {
            this.player.stop();
            this.isPlaying = false;
            this.playBtn.textContent = 'Play';
            this.stopBtn.disabled = true;
        }
    }

    validateSequenceForMIDI(sequence) {
        if (!sequence || !sequence.notes || sequence.notes.length === 0) {
            return { valid: false, error: 'No notes in sequence' };
        }
        
        // Validate this is an unquantized sequence (uses startTime/endTime, not quantized steps)
        // Quantized sequences cause timing issues with sequenceProtoToMidi()
        if (sequence.quantizationInfo) {
            return { valid: false, error: 'Cannot export quantized sequences to MIDI - use unquantized sequences' };
        }
        
        // Check for required MIDI export properties
        if (!sequence.ticksPerQuarter) {
            sequence.ticksPerQuarter = 220; // Standard MIDI resolution
        }
        
        if (!sequence.tempos || sequence.tempos.length === 0) {
            sequence.tempos = [{ time: 0, qpm: 120 }];
        }
        
        if (!sequence.timeSignatures || sequence.timeSignatures.length === 0) {
            sequence.timeSignatures = [{ time: 0, numerator: 4, denominator: 4 }];
        }
        
        // Ensure all notes have required unquantized properties
        for (let note of sequence.notes) {
            if (typeof note.pitch !== 'number' || 
                typeof note.startTime !== 'number' || 
                typeof note.endTime !== 'number') {
                return { valid: false, error: 'Invalid note properties - unquantized notes require pitch, startTime, endTime' };
            }
            
            // Validate timing makes sense
            if (note.startTime >= note.endTime) {
                return { valid: false, error: 'Invalid note timing - startTime must be less than endTime' };
            }
            
            // Add default velocity if missing
            if (!note.velocity) {
                note.velocity = 80;
            }
        }
        
        return { valid: true };
    }

    downloadMIDI() {
        if (!this.generatedSequence) {
            this.showStatus('error', 'No music to download. Generate some music first!');
            return;
        }

        try {
            // Validate and fix sequence structure for MIDI export
            const validation = this.validateSequenceForMIDI(this.generatedSequence);
            if (!validation.valid) {
                console.error('Sequence validation failed:', validation.error);
                this.showStatus('error', `Cannot export MIDI: ${validation.error}`);
                return;
            }
            
            // Create a deep copy to avoid modifying the original sequence
            const sequenceCopy = JSON.parse(JSON.stringify(this.generatedSequence));
            
            // Convert to MIDI
            const midi = mm.sequenceProtoToMidi(sequenceCopy);
            const blob = new Blob([midi], { type: 'audio/midi' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `ai-piano-music-${Date.now()}.mid`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            this.showStatus('success', 'MIDI file downloaded!');
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Error downloading MIDI:', error);
            this.showStatus('error', `Failed to download MIDI file: ${error.message}`);
        }
    }

    visualizeMusic(sequence) {
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!sequence || !sequence.notes || sequence.notes.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No music to visualize', canvas.width / 2, canvas.height / 2);
            return;
        }

        const notes = sequence.notes;
        const totalTime = sequence.totalTime || Math.max(...notes.map(n => n.endTime));
        const minPitch = Math.min(...notes.map(n => n.pitch));
        const maxPitch = Math.max(...notes.map(n => n.pitch));
        
        const timeScale = canvas.width / totalTime;
        const pitchScale = canvas.height / (maxPitch - minPitch + 1);

        notes.forEach(note => {
            const x = note.startTime * timeScale;
            const width = (note.endTime - note.startTime) * timeScale;
            const y = canvas.height - (note.pitch - minPitch + 1) * pitchScale;
            const height = pitchScale * 0.8;

            const hue = ((note.pitch - minPitch) / (maxPitch - minPitch)) * 240;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillRect(x, y, width, height);
            
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        });
    }

    showStatus(type, message) {
        this.hideStatus();
        const element = document.getElementById(type);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    hideStatus() {
        this.loadingDiv.classList.add('hidden');
        this.errorDiv.classList.add('hidden');
        this.successDiv.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const generator = new PianoMusicGenerator();
    
    // Try to load AI model in background
    generator.loadModel();
});