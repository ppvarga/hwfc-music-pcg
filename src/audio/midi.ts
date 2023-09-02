import MidiWriter, { Pitch } from "midi-writer-js"
import { OctavedNote } from "../music_theory/Note"
import { ChordResult, ChordResultWithRhythm, SectionResult } from "../wfc/hierarchy/results"
import { Chord } from "../music_theory/Chord"
import { durationOfRhythmPattern } from "../music_theory/Rhythm"

function noteToPitch(note: OctavedNote): Pitch {
	return `${note.getNote()}${note.getOctave()}`
}

function chordToMidi(chord: Chord, duration: number, in_track?: MidiWriter.Track): MidiWriter.Track {
	const track = in_track ?? new MidiWriter.Track()

	track.addEvent(new MidiWriter.NoteEvent({
		pitch: [noteToPitch(new OctavedNote(chord.getRoot(), 2)), ...chord.getNotes().map(note => noteToPitch(new OctavedNote(note, 3)))],
		duration: `T${duration * 128}`,
		sequential: false,
	}))

	return track
}

function finishMidi(tracks: MidiWriter.Track[], setSrc: (url: string) => void): void {
	const writer = new MidiWriter.Writer(tracks)
	const file = writer.buildFile()

	const blob = new Blob([file], {type: "octet/stream"})
	const url = window.URL.createObjectURL(blob)

	setSrc(url)
}

export function chordResultToMidi(chordResult: ChordResult, setSrc: (url: string) => void): void {
	const chordTrack = chordToMidi(chordResult.chord, chordResult.notes.length)

	const noteTrack = new MidiWriter.Track()

	noteTrack.addEvent(new MidiWriter.NoteEvent({
		pitch: chordResult.notes.map(noteToPitch),
		duration: "4",
		sequential: true,
	}))

	finishMidi([chordTrack, noteTrack], setSrc)
}

export function chordResultWithRhythmToMidi(chordResultWithRhythm: ChordResultWithRhythm, setSrc: (url: string) => void){
	const chordTrack = chordToMidi(chordResultWithRhythm.chord, durationOfRhythmPattern(chordResultWithRhythm.rhythmPattern))

	const noteTrack = new MidiWriter.Track()

	let wait = 0
	let noteIndex = 0
	chordResultWithRhythm.rhythmPattern.forEach((unit) => {
		if(unit.type == "note"){
			noteTrack.addEvent(new MidiWriter.NoteEvent({
				pitch: noteToPitch(chordResultWithRhythm.notes[noteIndex++]),
				duration: `T${unit.duration * 128}`,
				sequential: true,
				wait: `T${wait}`,
			}))
			wait = 0
		} else { // unit.type == "rest"
			wait += unit.duration * 128
		}
	})

	finishMidi([chordTrack, noteTrack], setSrc)
}

export function chordResultsWithRhythmToMidi(chordResultsWithRhythm: ChordResultWithRhythm[], setSrc: (url: string) => void){
	const chordTrack = new MidiWriter.Track()
	const noteTrack = new MidiWriter.Track()
  
	let wait = 0
	chordResultsWithRhythm.forEach((chordResultWithRhythm) => {
		chordToMidi(chordResultWithRhythm.chord, durationOfRhythmPattern(chordResultWithRhythm.rhythmPattern), chordTrack)

		let noteIndex = 0
		chordResultWithRhythm.rhythmPattern.forEach((unit) => {
			if(unit.type == "note"){
				noteTrack.addEvent(new MidiWriter.NoteEvent({
					pitch: noteToPitch(chordResultWithRhythm.notes[noteIndex++]),
					duration: `T${unit.duration * 128}`,
					sequential: true,
					wait: `T${wait}`,
				}))
				wait = 0
			} else { // unit.type == "rest"
				wait += unit.duration * 128
			}
		})
	})

	finishMidi([chordTrack, noteTrack], setSrc)
}

export function sectionResultToMidi(sectionResult: SectionResult, setSrc: (url: string) => void) {
	const chordTrack = new MidiWriter.Track()
	const noteTrack = new MidiWriter.Track()

	sectionResult.forEach((chordResult) => {
		chordToMidi(chordResult.chord, chordResult.notes.length, chordTrack)

		noteTrack.addEvent(new MidiWriter.NoteEvent({
			pitch: chordResult.notes.map(noteToPitch),
			duration: "4",
			sequential: true,
		}))
	})

	finishMidi([chordTrack, noteTrack], setSrc)
}

