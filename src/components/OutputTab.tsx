import { useRef, useState, useEffect } from "react"
import * as Tone from "tone"
import MidiWriter, { Pitch } from 'midi-writer-js'
import { lastChords, lockedChords, lastMelody, lockedMelody } from "../util/utils"
import { useAppContext } from "../AppState"
import { NoteOutput } from "./MidiPlayer"

const generateMidi = (notes: NoteOutput[]) => {
    let track = new MidiWriter.Track()
    const ticksPerSecond = 256

    notes.forEach(note => {
		track.addEvent(new MidiWriter.NoteEvent({
			pitch: note.octavedNote.toString() as Pitch, 
			startTick: Math.round(note.startTime * ticksPerSecond), 
			duration: `T${note.duration * ticksPerSecond -1}`
		}))
    })

    let write = new MidiWriter.Writer(track)
    return write.dataUri()
}

type OutputTabProps = {
	notes: NoteOutput[]
	length: number
	isPlaying: boolean
	setIsPlaying: (isPlaying: boolean) => void
	updatePlayer: () => void
}

export function OutputTab({ notes, length, isPlaying, setIsPlaying, updatePlayer }: OutputTabProps) {
	const { numChords, melodyLength, bpm, numSections } = useAppContext()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [currentNotesIndices, setCurrentNotesIndices] = useState<number[]>([])
	const synthRef = useRef<Tone.PolySynth>()
	if (!synthRef.current) {
		synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
	}
	const [volume, setVolume] = useState(-25)
	synthRef.current.volume.setValueAtTime(volume, Tone.context.currentTime)

	const noteRectHeight = 10
	const yPositions = notes.map(note => note.octavedNote.toY(noteRectHeight))
	const canvasHeight = Math.max(...yPositions) - Math.min(...yPositions) + 30
	
	const normalizedYPositions = yPositions.map(y => Math.min(...yPositions) - y + Math.max(canvasHeight - 20, (canvasRef?.current?.parentElement?.clientHeight ?? 0) - 40))
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

		notes.forEach((note, i) => {
			Tone.Transport.schedule(time => {
				setCurrentNotesIndices(prevIndices => [...prevIndices, i])
				synthRef.current!.triggerAttack(note.octavedNote.toString(), time)
			}, note.startTime)

			const releaseTime = i < notes.length - 1 && notes[i + 1].octavedNote.toString() === note.octavedNote.toString()
				? note.startTime + note.duration - 0.05 // introduce a 50ms delay for same notes
				: note.startTime + note.duration

				Tone.Transport.schedule(time => {
				setCurrentNotesIndices(prevIndices => prevIndices.filter(index => index !== i))
				synthRef.current!.triggerRelease(note.octavedNote.toString(), time)
			}, releaseTime)

			endTime = Math.max(endTime, note.startTime + note.duration)
		})

		Tone.Transport.schedule(() => resetPlayback(), endTime + 0.1) // slight delay to ensure all notes are released
		Tone.Transport.start()
	}

	useEffect(() => {
		return () => {
			resetPlayback()
		}
	}, [])

	const noteRectLength = 40
	let chordFocus = true
	let melodyFocus = true

	const drawNotes = () => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		notes.forEach((note, index) => {
			ctx.beginPath() // Start a new path
			ctx.moveTo(note.startTime * noteRectLength, 0) // Move the pen to the starting point
			ctx.lineTo(note.startTime * noteRectLength, canvas.height) // Draw a line to the ending point
			ctx.lineWidth = 1
			if (index % ((melodyLength + 4) * numChords) === 0) {
				ctx.lineWidth = 3
			}
			ctx.stroke() // Render the path
			const yPosition = normalizedYPositions[index]
			let alpha = 1
			if (!chordFocus && index % (melodyLength + 4) >= melodyLength) {
				alpha = 0.5
			}
			else if(!melodyFocus && index % (melodyLength + 4) < melodyLength) {
				alpha = 0.5
			}
			ctx.fillStyle = currentNotesIndices.includes(index) ? `rgba(255,0,0,${alpha})` : isLocked(index) ? `rgba(0,96,0,${alpha})` : `rgba(0,0,192,${alpha})`
			ctx.beginPath()
			ctx.roundRect(note.startTime * noteRectLength, yPosition, note.duration * noteRectLength, noteRectHeight, 50)
        	ctx.fill()
			ctx.fillStyle = "white"
			ctx.fillText(note.octavedNote.toString(), note.startTime * noteRectLength + 1, yPosition + noteRectHeight - 1 )
		})
	}

	let startX: number
	let currentX: number
	let isSelecting: boolean = false

	const mouseDown = (event: any) => {
		if (canvasRef.current) {
			const rect = canvasRef.current.getBoundingClientRect()
			startX = currentX = event.clientX - rect.left
			isSelecting = true
		}
	}

	const bg = "rgba(128, 128, 128, 0.50)"

	const mouseMove = (event: any) => {
		if (!canvasRef.current) return
		const rect = canvasRef.current.getBoundingClientRect()
		currentX = event.clientX - rect.left

		const melody = Math.floor(Math.ceil(Math.max(0, currentX) / (noteRectLength * (60 / bpm))) - 1 / melodyLength)
		const melodyStart = Math.floor(Math.ceil(Math.max(0, startX) / (noteRectLength * (60 / bpm))) - 1 / melodyLength)
		const chord = Math.floor(melody / melodyLength)
		const chordStart = Math.floor(melodyStart / melodyLength)

		const noteLenghtPercent = (noteRectLength * (60 / bpm)) / canvasRef.current.clientWidth * 100

		let backgroundValue: string
		let percents: number[]

		if (isSelecting) {
			const extra = currentX > startX ? 1 : 0
			if (!chordFocus) {
				percents = [(melody + extra) * noteLenghtPercent, (melodyStart + 1 - extra) * noteLenghtPercent]
			} else {
				percents = [(chord + extra) * melodyLength * noteLenghtPercent, (chordStart + 1 - extra) * melodyLength * noteLenghtPercent]
			}
			backgroundValue = `
					linear-gradient(
					to right,
					${bg} ${Math.min(percents[0], percents[1])}%,
					rgba(64, 64, 64, 0.50) ${Math.min(percents[0], percents[1])}%,
					rgba(64, 64, 64, 0.50) ${Math.max(percents[0], percents[1])}%,
					${bg} ${Math.max(percents[0], percents[1])}%
					)
				`
		} else {
			if (!chordFocus) {
				percents = [melody * noteLenghtPercent, (melody + 1) * noteLenghtPercent]
			} else {
				percents = [chord * melodyLength * noteLenghtPercent, (chord + 1) * melodyLength * noteLenghtPercent]
			}
			backgroundValue = `
					linear-gradient(
					to right,
					${bg} ${percents[0]}%,
					rgba(64, 64, 64, 0.50) ${percents[0]}%,
					rgba(64, 64, 64, 0.50) ${percents[1]}%,
					${bg} ${percents[1]}%
					)
				`
		}
		canvasRef.current.style.background = backgroundValue

	}
	
	const mouseUp = () => {
		if (canvasRef.current && isSelecting) {
			canvasRef.current.style.background = bg
			isSelecting = false
			lockRange(Math.min(startX, currentX), Math.max(startX, currentX))
		}
	}

	let scrollInterval: any
	const mouseOut = (event: any) => {
		if (canvasRef.current && canvasRef.current.parentElement && isSelecting) {
			const container = canvasRef.current.parentElement
			if (!scrollInterval) {
				scrollInterval = setInterval(() => {
					container.scrollLeft += event.pageX > container.clientWidth / 2 ? 10 : -10
				}, 16)
			}
		}
	}
	const mouseIn = () => {
		clearInterval(scrollInterval)
		scrollInterval = undefined
	}
	
	const lockRange = (start: number, end: number) => {
		let i = Math.ceil(Math.max(0, start) / (noteRectLength * (60 / bpm))) - 1
		let k = Math.ceil(Math.max(0, end) / (noteRectLength * (60 / bpm))) - 1
		let section: number
		let chord: number
		let note: number

		if (chordFocus) {
			i = Math.floor(i / melodyLength)
			k = Math.floor(k / melodyLength)
			for (i; i <= k; i++) {
				section = Math.floor(i / numChords)
				chord =  i % numChords
				if (lockedChords[section] === undefined) {
					lockedChords[section] = []
				}
				if (lockedChords[section][chord] === undefined) {
					lockedChords[section][chord] = lastChords[section][chord]
				} 
				else {
					delete lockedChords[section][chord]
				}
				if (melodyFocus) {
					if (lockedMelody[section] === undefined) {
						lockedMelody[section] = []
					}
					if (lockedMelody[section][chord] === undefined || JSON.stringify(lockedMelody[section][chord]) !== JSON.stringify(lastMelody[section][chord])) {
						lockedMelody[section][chord] = lastMelody[section][chord]
					}
					else {
						delete lockedMelody[section][chord]
					}
				}
			}
		} else if (melodyFocus) {
			for (i; i <= k; i++) {

				section = Math.floor(Math.floor(i / melodyLength) / numChords)
				chord =  Math.floor(i / melodyLength) % numChords
				note = i % melodyLength

				if (lockedMelody[section] === undefined) {
					lockedMelody[section] = []
				}
				if (lockedMelody[section][chord] === undefined) {
					lockedMelody[section][chord] = []
				}
				if (lockedMelody[section][chord][note] === undefined) {
					lockedMelody[section][chord][note] = lastMelody[section][chord][note]
				} else {
					delete lockedMelody[section][chord][note]
				}
			}
		}

		drawNotes()
	}

	function isLocked(index: number) {
		let chordNr = Math.floor(index / (melodyLength + 4)) % numChords
		let sectionNr = Math.floor(Math.floor(index / (melodyLength + 4)) / numChords)

		if(index % (melodyLength + 4) >= melodyLength) {
			if (lockedChords[sectionNr] !== undefined && lockedChords[sectionNr][chordNr] !== undefined) {
				return true
			}
		} else {
			let noteNr = index % (melodyLength + 4)
			if (lockedMelody[sectionNr] !== undefined && lockedMelody[sectionNr][chordNr] !== undefined && lockedMelody[sectionNr][chordNr][noteNr] !== undefined) {
				return true
			}
		}
		return false
	}

	const lockSection = (section: number) => {
		if (chordFocus) {
			if (lockedChords[section] !== undefined && JSON.stringify(lockedChords[section]) === JSON.stringify(lastChords[section])) {
				delete lockedChords[section]
			} else {
				lockedChords[section] = lastChords[section]
			}
		} if (melodyFocus) {
			if (lockedMelody[section] !== undefined && JSON.stringify(lockedMelody[section]) === JSON.stringify(lastMelody[section])) {
				delete lockedMelody[section]
			} else {
				lockedMelody[section] = lastMelody[section]
			}
		}
		drawNotes()
	}

	const focusChords = () => {
		if (chordFocus && melodyFocus) melodyFocus = false
		else if (chordFocus) melodyFocus = true
		else {
			chordFocus = true
			melodyFocus = false
		}
		drawNotes()
	}
	const focusMelody = () => {
		if (chordFocus && melodyFocus) chordFocus = false
		else if (melodyFocus) chordFocus = true
		else {
			melodyFocus = true
			chordFocus = false
		}
		drawNotes()
	}

	return (
		<>
		<div style={{ position: "absolute", left: "3vw", writingMode: "vertical-rl", transform: "rotate(180deg)", display: "flex"}}>
			{notes.length > 0 && <>
			<button style={{ fontSize: "0.5em", textOverflow: "clip", overflow: "hidden", height: "40vh" }} onClick={focusChords}>Focus Chords</button>
			<button style={{ fontSize: "0.5em", textOverflow: "clip", overflow: "hidden", height: "40vh" }} onClick={focusMelody}>Focus Melody</button>
			</>}
		</div>
		<div style={{ margin: "10px", marginBottom: "0px", display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "1fr auto", height: "80vh", overflow: "scroll" }}>
			<canvas style={{ background: bg, borderLeft: "3px solid black", borderRight: "3px solid black" }} ref={canvasRef} width={length * noteRectLength} height={Math.max(canvasHeight, (canvasRef?.current?.parentElement?.clientHeight ?? 0) - 25)} onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp} onMouseLeave={mouseOut} onMouseEnter={mouseIn}></canvas>
			{notes.length > 0 ?
			<div style={{ position: "sticky", bottom: "0px", width: `${length * noteRectLength}px`, display: "flex", gridColumn: "span 2", borderLeft: "3px solid black", borderRight: "3px solid black" }}>
				{Array.from({ length: numSections }).map((_, index) => (
					<button key={index} style={{ width: `${100 / numSections}%`, height: "25px", fontSize: "0.5em", textOverflow: "clip", overflow: "hidden" }} onClick={() => lockSection(index)}>
					Lock Section {index + 1}
					</button>
				))}
			</div> : <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "2em" }}>Generated output wil show here.</div>}
		</div>
		<div style={{fontSize: "1em", marginTop: "5px"}}>
			<button onClick={() => {
				lockedChords.length = 0
				lockedMelody.length = 0
				drawNotes()
			}}>
				Unlock all
			</button>
			<button onClick={updatePlayer} disabled={isPlaying}>
					Generate
			</button>
			<button onClick={handleTogglePlayback} disabled={notes.length < 1}>
					{isPlaying ? "■" : "▶"}
			</button>
			<button onClick={() => {
				const midiData = generateMidi(notes)
				const element = document.createElement("a")
				element.href = midiData
				element.download = "music.mid"
				document.body.appendChild(element)
				element.click()
			} }
				disabled={notes.length < 1}>
				Download MIDI
			</button>
			<label>
				{volume < -35 ? "🔈" : volume < -15 ? "🔉" : "🔊"}
				<input
					type="range"
					min="-50"
					max="0"
					step="5"
					value={volume}
					onChange={handleVolumeChange}
					style={{ marginLeft: "5px" }} />
			</label>
		</div>
		</>
	)
}
