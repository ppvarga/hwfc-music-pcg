import MidiWriter, { Pitch } from "midi-writer-js"
import { OctavedNote, Note } from "../music_theory/Note"
import {
	ChordResult,
	ChordResultWithRhythm,
} from "../wfc/hierarchy/results"
import { Chord } from "../music_theory/Chord"
import { durationOfRhythmPattern } from "../music_theory/Rhythm"
import { NoteOutput } from "../components/MidiPlayer"
import * as midiManager from 'midi-file';
import { parseArrayBuffer } from 'midi-json-parser';
import { read, MidiFile } from "midifile-ts"
import { intToNote } from "../music_theory/Note"
const baseDuration = (bpm: number) =>  60 / bpm

function noteToPitch(note: OctavedNote): Pitch {
	return `${note.getNote()}${note.getOctave()}`
}

function chordToMidi(
	chord: Chord,
	duration: number,
	in_track?: MidiWriter.Track,
): MidiWriter.Track {
	const track = in_track ?? new MidiWriter.Track()

	track.addEvent(
		new MidiWriter.NoteEvent({
			pitch: [
				noteToPitch(new OctavedNote(chord.getRoot(), 2)),
				...chord
					.getNotes()
					.map((note) => noteToPitch(new OctavedNote(note, 3))),
			],
			duration: `T${duration * 128}`,
			sequential: false,
		}),
	)

	return track
}

function finishMidi(
	tracks: MidiWriter.Track[],
	setSrc: (url: string) => void,
): void {
	const writer = new MidiWriter.Writer(tracks)
	const file = writer.buildFile()

	const blob = new Blob([file], { type: "octet/stream" })
	const url = window.URL.createObjectURL(blob)

	setSrc(url)
}




export function MidiToNoteOutput(midiFile: ArrayBuffer): NoteOutput[] { 
    const noteOutputs: NoteOutput[] = [];
	//const textEncoder = new TextEncoder()
    //console.log(new ArrayBuffer(midiFile))
	//const encoded = textEncoder.encode(midiFile)
	//const parsed = midiManager.parseMidi(midiFile);
	//const midi = read(encoded)
	const midi = read(midiFile)
	console.log("donwloaded midi")
	console.log(midi)
	//let currentTime = 0
	midi.tracks.forEach(track => {
        const activeNotes: { [key: number]: { startTime: number, deltaTime: number } } = {};
        let currentTime = 0;

        track.forEach(event => {
            currentTime += event.deltaTime;

            if (event.type == "channel" && event.subtype == "noteOn" && event.velocity > 0) {
                // Note on event
                const noteNumber = event.noteNumber;
                activeNotes[noteNumber] = { startTime: currentTime, deltaTime: event.deltaTime };
            } else if (event.type == "channel" && (event.subtype == "noteOff" || (event.subtype == "noteOn" && event.velocity === 0))) {
                // Note off event
                const noteNumber = event.noteNumber;
                if (activeNotes[noteNumber]) {
                    const { startTime, deltaTime } = activeNotes[noteNumber];
                    const duration = currentTime - startTime;
					const octave = Math.floor(noteNumber / 12) - 1;
                    const octavedNote = new OctavedNote(intToNote(noteNumber % 12), octave)
                    const noteOutput: NoteOutput = {
                        octavedNote: octavedNote,
                        startTime: startTime / (2 * midi.header.ticksPerBeat),
                        duration: duration / (2 * midi.header.ticksPerBeat) 
                    };

                    noteOutputs.push(noteOutput);
                    delete activeNotes[noteNumber];
                }
            }
        });
    });
	
	
    
	//console.log(midi)
    return noteOutputs;
}
export function chordResultToMidi(
	chordResult: ChordResult,
	setSrc: (url: string) => void,
): void {
	const chordTrack = chordToMidi(chordResult.chord, chordResult.notes.length)

	const noteTrack = new MidiWriter.Track()

	noteTrack.addEvent(
		new MidiWriter.NoteEvent({
			pitch: chordResult.notes.map(noteToPitch),
			duration: "4",
			sequential: true,
		}),
	)

	finishMidi([chordTrack, noteTrack], setSrc)
}

export function chordResultWithRhythmToMidi(
	chordResultWithRhythm: ChordResultWithRhythm,
	setSrc: (url: string) => void,
) {
	const chordTrack = chordToMidi(
		chordResultWithRhythm.chord,
		durationOfRhythmPattern(chordResultWithRhythm.rhythmPattern),
	)

	const noteTrack = new MidiWriter.Track()

	let wait = 0
	let noteIndex = 0
	chordResultWithRhythm.rhythmPattern.forEach((unit) => {
		if (unit.type == "note") {
			noteTrack.addEvent(
				new MidiWriter.NoteEvent({
					pitch: noteToPitch(
						chordResultWithRhythm.notes[noteIndex++],
					),
					duration: `T${unit.duration * 128}`,
					sequential: true,
					wait: `T${wait}`,
				}),
			)
			wait = 0
		} else {
			// unit.type == "rest"
			wait += unit.duration * 128
		}
	})

	finishMidi([chordTrack, noteTrack], setSrc)
}

export function chordResultsWithRhythmToMidi(
	chordResultsWithRhythm: ChordResultWithRhythm[],
	setSrc: (url: string) => void,
) {
	const chordTrack = new MidiWriter.Track()
	const noteTrack = new MidiWriter.Track()

	let wait = 0
	chordResultsWithRhythm.forEach((chordResultWithRhythm) => {
		chordToMidi(
			chordResultWithRhythm.chord,
			durationOfRhythmPattern(chordResultWithRhythm.rhythmPattern),
			chordTrack,
		)

		let noteIndex = 0
		chordResultWithRhythm.rhythmPattern.forEach((unit) => {
			if (unit.type == "note") {
				noteTrack.addEvent(
					new MidiWriter.NoteEvent({
						pitch: noteToPitch(
							chordResultWithRhythm.notes[noteIndex++],
						),
						duration: `T${unit.duration * 128}`,
						sequential: true,
						wait: `T${wait}`,
					}),
				)
				wait = 0
			} else {
				// unit.type == "rest"
				wait += unit.duration * 128
			}
		})
	})

	finishMidi([chordTrack, noteTrack], setSrc)
}

function chordToNoteOutput(
	chord: Chord,
	startTime: number,
	duration: number,
): NoteOutput[] {
	const out: NoteOutput[] = []

	out.push({
		octavedNote: new OctavedNote(chord.getRoot(), 2),
		startTime,
		duration,
	})

	chord.getNotes().forEach((note) => {
		out.push({
			octavedNote: new OctavedNote(note, 3),
			startTime,
			duration,
		})
	})

	return out
}

export function chordResultToOutput(
	chordResult: ChordResult,
	bpm: number,
	offset: number,
): [NoteOutput[], number] {
	let time = offset
	const out: NoteOutput[] = []
	chordResult.notes.forEach((octavedNote) => {
		out.push({ octavedNote, startTime: time, duration: baseDuration(bpm) })
		time += baseDuration(bpm)
	})

	out.push(
		...chordToNoteOutput(
			chordResult.chord,
			offset,
			chordResult.notes.length * baseDuration(bpm),
		),
	)
	return [out, time]
}

export function chordResultWithRhythmToOutput(
	chordResultWithRhythm: ChordResultWithRhythm,
	bpm: number,
	offset: number,
): [NoteOutput[], number] {
	let time = offset
	let noteIndex = 0
	const out: NoteOutput[] = []
	chordResultWithRhythm.rhythmPattern.forEach((unit) => {
		if (unit.type == "note") {
			out.push({
				octavedNote: chordResultWithRhythm.notes[noteIndex++],
				startTime: time,
				duration: unit.duration * baseDuration(bpm),
			})
		}
		time += unit.duration * baseDuration(bpm)
	})

	out.push(
		...chordToNoteOutput(
			chordResultWithRhythm.chord,
			offset,
			durationOfRhythmPattern(chordResultWithRhythm.rhythmPattern) *
				baseDuration(bpm),
		),
	)
	return [out, time]
}

