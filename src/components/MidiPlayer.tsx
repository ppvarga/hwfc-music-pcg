import { useRef, useState, useEffect } from "react"
import * as Tone from "tone"
import { OctavedNote } from "../music_theory/Note"
import MidiWriter, { Pitch } from 'midi-writer-js';
// import { useAppContext } from "../AppState";

const normalizeYPositions = (yPositions: number[]): number[] => {
	const maxY = Math.max(...yPositions)
	return yPositions.map(y => maxY - y)
}

export type NoteOutput = {
	octavedNote: OctavedNote;
	startTime: number;
	duration: number;
	instrument?: number;
};

const generateMidi = (notes: NoteOutput[]) => {//, numInstruments: number) => {
	// let tracks: MidiWriter.Track[] = []
	// for (let i = 0; i < numInstruments; i++) {
	// 	tracks.push(new MidiWriter.Track())
	// }
	// console.log(tracks)
    let track = new MidiWriter.Track();
    const ticksPerSecond = 256;

    notes.forEach(note => {
		note.instrument = !note.instrument ? 1 : note.instrument
		track.addEvent(new MidiWriter.NoteEvent({
		// tracks[note.instrument - 1].addEvent(new MidiWriter.NoteEvent({
			pitch: note.octavedNote.toString() as Pitch, 
			startTick: Math.round(note.startTime * ticksPerSecond), 
			duration: `T${note.duration * ticksPerSecond -1}`
		}));
		// tracks[note.instrument - 1].addEvent(new MidiWriter.ProgramChangeEvent({ instrument: note.instrument == 1 ? 1 : (note.instrument - 1) * 10 }))
    });

    let write = new MidiWriter.Writer(track);
    return write.dataUri();
};

type MidiPlayerProps = {
	notes: NoteOutput[];
	length: number;
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
	updatePlayer: (test: boolean) => void;
};

// const synths: Tone.VoiceConstructor<Tone.Synth<Tone.SynthOptions>>[] = [Tone.Synth, Tone.MonoSynth, Tone.AMSynth, Tone.FMSynth, Tone.MembraneSynth]

export function MidiPlayer({ notes, length, isPlaying, setIsPlaying, updatePlayer }: MidiPlayerProps) {
	// const { numInstruments } = useAppContext()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [currentNotesIndices, setCurrentNotesIndices] = useState<number[]>([])
	const synthRef = useRef<Tone.PolySynth>();
	if (!synthRef.current) {
		synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
	}
	// const synthRefs = useRef<Tone.PolySynth[]>();
	// if (!synthRefs.current) {
	// 	synthRef.current = synths.map((synth) => new Tone.PolySynth(synth).toDestination())
	// }
	const [volume, setVolume] = useState(-25)
	synthRef.current.volume.setValueAtTime(volume, Tone.context.currentTime)
	// const FMSynthRef = useRef<Tone.PolySynth>();
	// if (!FMSynthRef.current) {
	// 	FMSynthRef.current = new Tone.PolySynth(Tone.FMSynth).toDestination();
	// }
	// FMSynthRef.current.volume.setValueAtTime(volume, Tone.context.currentTime)
	const noteRectHeight = 2
	const yPositions = notes.map(note => note.octavedNote.toY(noteRectHeight))
	const normalizedYPositions = normalizeYPositions(yPositions)
	const canvasHeight = Math.max(...normalizedYPositions) + 20

	const pianoRef = useRef<Tone.Sampler>();
	if (!pianoRef.current) {
		pianoRef.current = new Tone.Sampler({
			urls: {
				'A7': 'A7.[mp3|ogg]',
				'A1': 'A1.[mp3|ogg]',
				'A2': 'A2.[mp3|ogg]',
				'A3': 'A3.[mp3|ogg]',
				'A4': 'A4.[mp3|ogg]',
				'A5': 'A5.[mp3|ogg]',
				'A6': 'A6.[mp3|ogg]',
				'A#7': 'As7.[mp3|ogg]',
				'A#1': 'As1.[mp3|ogg]',
				'A#2': 'As2.[mp3|ogg]',
				'A#3': 'As3.[mp3|ogg]',
				'A#4': 'As4.[mp3|ogg]',
				'A#5': 'As5.[mp3|ogg]',
				'A#6': 'As6.[mp3|ogg]',
				'B7': 'B7.[mp3|ogg]',
				'B1': 'B1.[mp3|ogg]',
				'B2': 'B2.[mp3|ogg]',
				'B3': 'B3.[mp3|ogg]',
				'B4': 'B4.[mp3|ogg]',
				'B5': 'B5.[mp3|ogg]',
				'B6': 'B6.[mp3|ogg]',
				'C7': 'C7.[mp3|ogg]',
				'C1': 'C1.[mp3|ogg]',
				'C2': 'C2.[mp3|ogg]',
				'C3': 'C3.[mp3|ogg]',
				'C4': 'C4.[mp3|ogg]',
				'C5': 'C5.[mp3|ogg]',
				'C6': 'C6.[mp3|ogg]',
				'C#7': 'Cs7.[mp3|ogg]',
				'C#1': 'Cs1.[mp3|ogg]',
				'C#2': 'Cs2.[mp3|ogg]',
				'C#3': 'Cs3.[mp3|ogg]',
				'C#4': 'Cs4.[mp3|ogg]',
				'C#5': 'Cs5.[mp3|ogg]',
				'C#6': 'Cs6.[mp3|ogg]',
				'D7': 'D7.[mp3|ogg]',
				'D1': 'D1.[mp3|ogg]',
				'D2': 'D2.[mp3|ogg]',
				'D3': 'D3.[mp3|ogg]',
				'D4': 'D4.[mp3|ogg]',
				'D5': 'D5.[mp3|ogg]',
				'D6': 'D6.[mp3|ogg]',
				'D#7': 'Ds7.[mp3|ogg]',
				'D#1': 'Ds1.[mp3|ogg]',
				'D#2': 'Ds2.[mp3|ogg]',
				'D#3': 'Ds3.[mp3|ogg]',
				'D#4': 'Ds4.[mp3|ogg]',
				'D#5': 'Ds5.[mp3|ogg]',
				'D#6': 'Ds6.[mp3|ogg]',
				'E7': 'E7.[mp3|ogg]',
				'E1': 'E1.[mp3|ogg]',
				'E2': 'E2.[mp3|ogg]',
				'E3': 'E3.[mp3|ogg]',
				'E4': 'E4.[mp3|ogg]',
				'E5': 'E5.[mp3|ogg]',
				'E6': 'E6.[mp3|ogg]',
				'F7': 'F7.[mp3|ogg]',
				'F1': 'F1.[mp3|ogg]',
				'F2': 'F2.[mp3|ogg]',
				'F3': 'F3.[mp3|ogg]',
				'F4': 'F4.[mp3|ogg]',
				'F5': 'F5.[mp3|ogg]',
				'F6': 'F6.[mp3|ogg]',
				'F#7': 'Fs7.[mp3|ogg]',
				'F#1': 'Fs1.[mp3|ogg]',
				'F#2': 'Fs2.[mp3|ogg]',
				'F#3': 'Fs3.[mp3|ogg]',
				'F#4': 'Fs4.[mp3|ogg]',
				'F#5': 'Fs5.[mp3|ogg]',
				'F#6': 'Fs6.[mp3|ogg]',
				'G7': 'G7.[mp3|ogg]',
				'G1': 'G1.[mp3|ogg]',
				'G2': 'G2.[mp3|ogg]',
				'G3': 'G3.[mp3|ogg]',
				'G4': 'G4.[mp3|ogg]',
				'G5': 'G5.[mp3|ogg]',
				'G6': 'G6.[mp3|ogg]',
				'G#7': 'Gs7.[mp3|ogg]',
				'G#1': 'Gs1.[mp3|ogg]',
				'G#2': 'Gs2.[mp3|ogg]',
				'G#3': 'Gs3.[mp3|ogg]',
				'G#4': 'Gs4.[mp3|ogg]',
				'G#5': 'Gs5.[mp3|ogg]',
				'G#6': 'Gs6.[mp3|ogg]'
			},
			baseUrl: "/samplers/piano/",
		}).toDestination();
	}

	const bassRef = useRef<Tone.Sampler>();
	if (!bassRef.current) {
		bassRef.current = new Tone.Sampler({
			urls: {
				'A#1': 'As1.[mp3|ogg]',
				'A#2': 'As2.[mp3|ogg]',
				'A#3': 'As3.[mp3|ogg]',
				'A#4': 'As4.[mp3|ogg]',
				'C#1': 'Cs1.[mp3|ogg]',
				'C#2': 'Cs2.[mp3|ogg]',
				'C#3': 'Cs3.[mp3|ogg]',
				'C#4': 'Cs4.[mp3|ogg]',
				'E1': 'E1.[mp3|ogg]',
				'E2': 'E2.[mp3|ogg]',
				'E3': 'E3.[mp3|ogg]',
				'E4': 'E4.[mp3|ogg]',
				'G1': 'G1.[mp3|ogg]',
				'G2': 'G2.[mp3|ogg]',
				'G3': 'G3.[mp3|ogg]',
				'G4': 'G4.[mp3|ogg]'
			},
			baseUrl: "samplers/bass-electric/",
		}).toDestination()
	}

	const violinRef = useRef<Tone.Sampler>();
	if (!violinRef.current) {
		violinRef.current = new Tone.Sampler({
			urls: {
				'A3': 'A3.[mp3|ogg]',
				'A4': 'A4.[mp3|ogg]',
				'A5': 'A5.[mp3|ogg]',
				'A6': 'A6.[mp3|ogg]',
				'C4': 'C4.[mp3|ogg]',
				'C5': 'C5.[mp3|ogg]',
				'C6': 'C6.[mp3|ogg]',
				'C7': 'C7.[mp3|ogg]',
				'E4': 'E4.[mp3|ogg]',
				'E5': 'E5.[mp3|ogg]',
				'E6': 'E6.[mp3|ogg]',
				'G4': 'G4.[mp3|ogg]',
				'G5': 'G5.[mp3|ogg]',
				'G6': 'G6.[mp3|ogg]'
			},
			baseUrl: "samplers/violin/",
		}).toDestination()
	}

	const saxophoneRef = useRef<Tone.Sampler>();
	if (!saxophoneRef.current) {
		saxophoneRef.current = new Tone.Sampler({
			urls: {
				'D#5': 'Ds5.[mp3|ogg]',
				'E3': 'E3.[mp3|ogg]',
				'E4': 'E4.[mp3|ogg]',
				'E5': 'E5.[mp3|ogg]',
				'F3': 'F3.[mp3|ogg]',
				'F4': 'F4.[mp3|ogg]',
				'F5': 'F5.[mp3|ogg]',
				'F#3': 'Fs3.[mp3|ogg]',
				'F#4': 'Fs4.[mp3|ogg]',
				'F#5': 'Fs5.[mp3|ogg]',
				'G3': 'G3.[mp3|ogg]',
				'G4': 'G4.[mp3|ogg]',
				'G5': 'G5.[mp3|ogg]',
				'G#3': 'Gs3.[mp3|ogg]',
				'G#4': 'Gs4.[mp3|ogg]',
				'G#5': 'Gs5.[mp3|ogg]',
				'A4': 'A4.[mp3|ogg]',
				'A5': 'A5.[mp3|ogg]',
				'A#3': 'As3.[mp3|ogg]',
				'A#4': 'As4.[mp3|ogg]',
				'B3': 'B3.[mp3|ogg]',
				'B4': 'B4.[mp3|ogg]',
				'C4': 'C4.[mp3|ogg]',
				'C5': 'C5.[mp3|ogg]',
				'C#3': 'Cs3.[mp3|ogg]',
				'C#4': 'Cs4.[mp3|ogg]',
				'C#5': 'Cs5.[mp3|ogg]',
				'D3': 'D3.[mp3|ogg]',
				'D4': 'D4.[mp3|ogg]',
				'D5': 'D5.[mp3|ogg]',
				'D#3': 'Ds3.[mp3|ogg]',
				'D#4': 'Ds4.[mp3|ogg]'
			},
			baseUrl: "samplers/saxophone/",
		}).toDestination()
	}

	useEffect(() => {
		drawNotes()
	}, [notes, currentNotesIndices])

	const resetPlayback = () => {
		setCurrentNotesIndices([])
		setIsPlaying(false)
		Tone.Transport.cancel()
		Tone.Transport.stop()
		synthRef.current!.releaseAll()
	}

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(event.target.value)
		setVolume(newVolume)
		synthRef.current!.volume.setValueAtTime(newVolume, Tone.context.currentTime)
	}

	const handleTogglePlayback = () => {
		if (isPlaying) {
			resetPlayback()
			return
		}
		Tone.Transport.cancel()

		Tone.start()
		setIsPlaying(true)
		let endTime = 0
		let playedChords = false

		notes.forEach((note, i) => {
			if (note.instrument && note.instrument > 1) playedChords = true
			if (playedChords && note.instrument && note.instrument == 1) playedChords = false
			if (!(playedChords && !note.instrument)) {
				const instrument = !note.instrument || note.instrument == 4 ? pianoRef.current
					: note.instrument == 1 ? bassRef.current
					: note.instrument == 2 ? saxophoneRef.current
					: violinRef.current

				// const curSynth = !note.instrument || note.instrument == 1 ? synthRef : FMSynthRef
				Tone.Transport.schedule(time => {
					setCurrentNotesIndices(prevIndices => [...prevIndices, i])
					//synthRef.current!.triggerAttack(note.octavedNote.toString(), time)
					instrument!.triggerAttack(note.octavedNote.toString(), time)
				}, note.startTime)

				const releaseTime = i < notes.length - 1 && notes[i + 1].octavedNote.toString() === note.octavedNote.toString()
					? note.startTime + note.duration - 0.05 // introduce a 50ms delay for same notes
					: note.startTime + note.duration

				Tone.Transport.schedule(time => {
					setCurrentNotesIndices(prevIndices => prevIndices.filter(index => index !== i))
					//synthRef.current!.triggerRelease(note.octavedNote.toString(), time)
					instrument!.triggerRelease(note.octavedNote.toString(), time)
				}, releaseTime)

				endTime = Math.max(endTime, note.startTime + note.duration)
			}
			
		})

		Tone.Transport.schedule(() => resetPlayback(), endTime + 0.1) // slight delay to ensure all notes are released
		Tone.Transport.start()
	}

	useEffect(() => {
		return () => {
			//synthRef.current?.dispose()
			resetPlayback()
		}
	}, [])

	const noteRectLength = 20

	const drawNotes = () => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		notes.forEach((note, index) => {
			const yPosition = normalizedYPositions[index]
			ctx.fillStyle = currentNotesIndices.includes(index) ? "red" : "blue"
			ctx.fillRect(note.startTime * noteRectLength, yPosition, note.duration * noteRectLength, noteRectHeight)
		})
	}

	return (
		<div style={{ paddingTop: "1em" , display: "flex", flexDirection: "row", maxWidth: "90vw", alignItems:"center"}}>
			<div>
				<button onClick={() => updatePlayer(false)} disabled={isPlaying}>
					Generate
				</button>
				<button onClick={handleTogglePlayback} disabled={notes.length < 1}>
					{isPlaying ? "■" : "▶"}
				</button>
				<button onClick={() => {
						const midiData = generateMidi(notes);
						const element = document.createElement("a");
						element.href = midiData;
						element.download = "music.mid";
						document.body.appendChild(element);
						element.click();
						}
					} 
					disabled={notes.length < 1}>
					Download MIDI
				</button>
				<br />
				<div style={{ padding: "1em", width: "180px", textAlign: "center" }}>
					<label>
						{volume < -35 ? "🔈" : volume < -15 ? "🔉" : "🔊"}
						<input
							type="range"
							min="-50"
							max="0"
							step="5"
							value={volume}
							onChange={handleVolumeChange}
							style={{ marginLeft: "5px", verticalAlign: "middle" }}
						/>
					</label>
				</div>
			</div>
			
			
			{notes.length > 0 &&
			<div style={{ overflowX: "scroll", paddingTop: "1em" }}>
				<canvas ref={canvasRef} width={length * noteRectLength} height={canvasHeight}></canvas>
			</div>
			}
		</div>
	)
}
