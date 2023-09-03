import { useRef, useState, useEffect } from "react"
import { Synth } from "tone"
import { OctavedNote } from "./music_theory/Note"
import * as Tone from "tone"

type NoteType = {
  octavedNote: OctavedNote;
  startTime: number;
  duration: number;
};

type MidiPlayerProps = {
  notes: NoteType[];
};

const normalizeYPositions = (yPositions: number[]): number[] => {
	const maxY = Math.max(...yPositions)
	return yPositions.map(y => maxY - y)
}

export function MidiPlayer({ notes }: MidiPlayerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)
	const [isPlaying, setIsPlaying] = useState(false)
	const synthRef = useRef<Tone.Synth | null>(null)

	useEffect(() => {
		synthRef.current = new Synth().toDestination()
		return () => {
			synthRef.current?.dispose()
		}
	}, [])

	const yPositions = notes.map(note => note.octavedNote.toY())
	const normalizedYPositions = normalizeYPositions(yPositions)
	const canvasHeight = Math.max(...normalizedYPositions) + 20

	useEffect(() => {
		drawNotes()
	}, [notes, currentNoteIndex])

	const handleTogglePlayback = () => {
		if (isPlaying) {
			setIsPlaying(false)
			setCurrentNoteIndex(-1)
			Tone.Transport.stop()
			Tone.Transport.cancel()
			return
		}

		setIsPlaying(true)

		let time = Tone.Transport.seconds
		notes.forEach((note, i) => {
			Tone.Transport.schedule(time => {
				setCurrentNoteIndex(i)
				synthRef.current?.triggerAttackRelease(note.octavedNote.toString(), note.duration, time)
			}, time)
			time += note.duration
		})

		Tone.Transport.schedule(() => {
			setIsPlaying(false)
			setCurrentNoteIndex(-1)
		}, time)

		Tone.Transport.start()
	}

	useEffect(() => {
		return () => {
			Tone.Transport.cancel()
		}
	}, [])

	const drawNotes = () => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		notes.forEach((note, index) => {
			const yPosition = normalizedYPositions[index]
			ctx.fillStyle = index === currentNoteIndex ? "red" : "blue"
			ctx.fillRect(note.startTime * 100, yPosition, note.duration * 100, 20)
		})
	}

	return (
		<div style={{ width: "800px", overflowX: "scroll" }}>
			<button onClick={handleTogglePlayback}>
				{isPlaying ? "Stop" : "Play"}
			</button>
			<canvas ref={canvasRef} width={notes.length * 100} height={canvasHeight}></canvas>
		</div>
	)
}