import { useRef, useState, useEffect } from "react"
import { PolySynth, Synth, Transport } from "tone"
import { OctavedNote } from "../music_theory/Note"

const normalizeYPositions = (yPositions: number[]): number[] => {
	const maxY = Math.max(...yPositions)
	return yPositions.map(y => maxY - y)
}

export type NoteOutput = {
  octavedNote: OctavedNote;
  startTime: number;
  duration: number;
};

type MidiPlayerProps = {
  notes: NoteOutput[];
  length: number;
};

export function MidiPlayer({ notes, length }: MidiPlayerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [currentNotesIndices, setCurrentNotesIndices] = useState<number[]>([])
	const [isPlaying, setIsPlaying] = useState(false)
	const synthRef = useRef(new PolySynth(Synth).toDestination())

	const yPositions = notes.map(note => note.octavedNote.toY())
	const normalizedYPositions = normalizeYPositions(yPositions)
	const canvasHeight = Math.max(...normalizedYPositions) + 20

	useEffect(() => {
		drawNotes()
	}, [notes, currentNotesIndices])

	const resetPlayback = () => {
		setCurrentNotesIndices([])
		setIsPlaying(false)
		Transport.cancel()
		Transport.stop()
		synthRef.current.releaseAll()
	}

	const handleTogglePlayback = () => {
		if (isPlaying) {
			resetPlayback()
			return
		}

		setIsPlaying(true)
		let endTime = 0

		notes.forEach((note, i) => {
			Transport.schedule(time => {
				setCurrentNotesIndices(prevIndices => [...prevIndices, i])
				synthRef.current.triggerAttack(note.octavedNote.toString(), time)
			}, note.startTime)

			const releaseTime = i < notes.length - 1 && notes[i + 1].octavedNote.toString() === note.octavedNote.toString()
				? note.startTime + note.duration - 0.05 // introduce a 50ms delay for same notes
				: note.startTime + note.duration

			Transport.schedule(time => {
				setCurrentNotesIndices(prevIndices => prevIndices.filter(index => index !== i))
				synthRef.current.triggerRelease(note.octavedNote.toString(), time)
			}, releaseTime)

			endTime = Math.max(endTime, note.startTime + note.duration)
		})

		Transport.schedule(() => resetPlayback(), endTime + 0.1) // slight delay to ensure all notes are released
		Transport.start()
	}

	useEffect(() => {
		return () => resetPlayback()
	}, [])

	const drawNotes = () => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		notes.forEach((note, index) => {
			const yPosition = normalizedYPositions[index]
			ctx.fillStyle = currentNotesIndices.includes(index) ? "red" : "blue"
			ctx.fillRect(note.startTime * 35, yPosition, note.duration * 35, 10)
		})
	}

	return (
		notes.length > 0 &&
		<div style={{paddingTop:"1em"}}>
			<button onClick={handleTogglePlayback}>
				{isPlaying ? "Stop" : "Play"}
			</button>
			<div style={{ overflowX: "scroll" , paddingTop: "1em"}}>
				<canvas ref={canvasRef} width={length * 35} height={canvasHeight}></canvas>
			</div>
		</div>
	)
}
