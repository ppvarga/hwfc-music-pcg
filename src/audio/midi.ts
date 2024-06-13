import MidiWriter, { Pitch } from "midi-writer-js"
import { OctavedNote, Note, OctavedNoteIR, parseOctavedNoteIR, parseOctavedNoteIRs, noteToInt } from "../music_theory/Note"
import {
	ChordResult,
	ChordResultWithRhythm,
} from "../wfc/hierarchy/results"
import { Chord, ChordIR, stringToChordIR } from "../music_theory/Chord"
import { durationOfRhythmPattern } from "../music_theory/Rhythm"
import { NoteOutput } from "../components/MidiPlayer"
import * as midiManager from 'midi-file';
import { parseArrayBuffer } from 'midi-json-parser';
import { read, MidiFile } from "midifile-ts"
import { intToNote } from "../music_theory/Note"
import { TileCanvas, TileCanvasProps } from "../wfc/TileCanvas"
import { ConstraintSet } from "../wfc/ConstraintSet"

import axios from 'axios';
import { InfiniteArray } from "../wfc/InfiniteArray"
import { OptionsPerCell } from "../wfc/OptionsPerCell"
import { ChordConstraintIR, NoteConstraintIR, convertIRToChordConstraint, convertIRToNoteConstraint } from "../wfc/constraints/constraintUtils"
import { Chordesque, chordesqueIRMapToChordesqueMap } from "../wfc/hierarchy/Chordesque"
import { ConstraintHierarchy } from "../wfc/constraints/ConstraintInferrer/ConstraintHierarchy"
import { HigherValues } from "../wfc/HigherValues"
import { chord } from "music21j"
import { errorsInAppState, useAppContext } from "../AppState"
import { useState } from "react"
import { parseChordPrototypes } from "../components/Output"
import { Random } from "../util/Random"
import { SectionOnlyFollowedByHardConstraint } from "../wfc/constraints/SectionOnlyFollowedByHardConstraint"
import { SectionOnlyPrecededByHardConstraint } from "../wfc/constraints/SectionOnlyPrecededByHardConstraint"
import { Constraint } from "../wfc/constraints/concepts/Constraint"
import { constantStringArrayGrabber } from "../wfc/grabbers/constantGrabbers"
import { Section, sectionIRToSection, sectionIRMapToSectionMap } from "../wfc/hierarchy/Section"
import { SectionLevelNode } from "../wfc/hierarchy/SectionLevelNode"
import { MusicalKey } from "../music_theory/MusicalKey"

function noteToPitch(note: OctavedNote): Pitch {
	return `${note.getNote()}${note.getOctave()}`
}

export type NoteOutput2 = {
	octavedNote: OctavedNote;
    startTime: number;
    duration: number;
    measure: number;
	
};
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

async function analyzeMidi(midiArrayBuffer: ArrayBuffer): Promise<any> {
    const formData = new FormData();
    const blob = new Blob([midiArrayBuffer], { type: 'application/octet-stream' });
    formData.append('file', blob, 'file.mid');

    try {
        const response = await axios.post('http://localhost:5000/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
				"Access-Control-Allow-Origin": "http://127.0.0.1:5173/audio-wfc/"
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error analyzing MIDI file:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
}

const isAnalysisResult = (data: any): data is AnalysisResult => {
    return Array.isArray(data) && data.every(part => 
        Array.isArray(part) && part.every(measure =>
            'measureNumber' in measure &&
            'notes' in measure && Array.isArray(measure.notes) &&
            measure.notes.every((note: { is_chord: any; pitches: any; root: any; start_time: any; duration: any; measure: any; pitch: any }) =>
                ('is_chord' in note) &&
                (note.is_chord 
                    ? Array.isArray(note.pitches) && typeof note.root === 'string' && typeof note.start_time === 'number' && typeof note.duration === 'number' && typeof note.measure === 'number'
                    : typeof note.pitch === 'string' && typeof note.start_time === 'number' && typeof note.duration === 'number' && typeof note.measure === 'number'
                )
            )
        )
    );
}; 

const convertToAnalysisResult = (data: any): AnalysisResult | null => {
    if (isAnalysisResult(data)) {
        return data;
    } else {
        console.error('Invalid data format');
        return null;
    }
}
// Define TypeScript interfaces for the received data
interface NoteData {
    pitch: string;
    start_time: number;
    duration: number;
    is_chord: false;
    measure: number;
}

interface ChordData {
    pitches: string[];
    start_time: number;
    duration: number;
    is_chord: true;
    measure: number;
	root: string;
	quality: string;
}

interface Measure {
    measureNumber: number;
    notes: (NoteData | ChordData)[];
}

type AnalysisResult = Measure[];

function isNoteData(obj: any): obj is NoteData {
    return typeof obj.pitch === 'string' &&
        typeof obj.start_time === 'number' &&
        typeof obj.duration === 'number' &&
        obj.is_chord === false &&
        typeof obj.measure === 'number';
}

function isChordData(obj: any): obj is ChordData {
    return Array.isArray(obj.pitches) &&
        obj.pitches.every((pitch: any) => typeof pitch === 'string') &&
        typeof obj.start_time === 'number' &&
        typeof obj.duration === 'number' &&
        obj.is_chord === true &&
        typeof obj.measure === 'number' &&
        typeof obj.root === 'string' &&
        typeof obj.quality === 'string';
}

function isMeasure(obj: any): obj is Measure {
    return typeof obj.measureNumber === 'number' &&
        Array.isArray(obj.notes) &&
        obj.notes.every((note: any) => isNoteData(note) || isChordData(note));
}


function countNoteAndChordData(notes: (NoteData | ChordData)[]): { noteCount: number, chordCount: number } {
    let noteCount = 0;
    let chordCount = 0;

    for (const note of notes) {
        if (isNoteData(note)) {
            noteCount++;
        } else if (isChordData(note)) {
            chordCount++;
        }
    }

    return { noteCount, chordCount };
}


export function testFunction(notes: Measure[]) {
	//const [isPlaying, setIsPlaying] = useState(false)
	const appState = useAppContext()
	const { output, setOutput, onlyUseChordPrototypes, chordPrototypes, inferKey, inferMelodyKey, differentMelodyKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, minNumNotes, startOnNote, maxRestLength, useRhythm, sections, sectionOptionsPerCell, numSections, bpm} = appState

	function parseSections(): [Section[], Constraint<Section>[]] {
		const parsedSections = []
		const sectionConstraints = []

		const properlyNamedSections = sections.map(section => {
			if (section.name !== "") return section
			const sectionName = `Section${section.id}`
			return { ...section, name: sectionName }
		})

		for (const sectionIR of properlyNamedSections) {
			parsedSections.push(sectionIRToSection(sectionIR, chordPrototypes, onlyUseChordPrototypes))

			if (sectionIR.restrictPrecedingSections) {
				if (sectionIR.allowedPrecedingSections.every(sectionName => {
					if (properlyNamedSections.some(section => section.name === sectionName)) return true
					return (Chord.parseChordString(sectionName) !== undefined)
				})) {
					sectionConstraints.push(new SectionOnlyPrecededByHardConstraint(sectionIR.name, constantStringArrayGrabber(sectionIR.allowedPrecedingSections)))
				}
			}

			if (sectionIR.restrictFollowingSections) {
				if (sectionIR.allowedFollowingSections.every(sectionName => {
					if (properlyNamedSections.some(section => section.name === sectionName)) return true
					return (Chord.parseChordString(sectionName) !== undefined)
				})) {
					sectionConstraints.push(new SectionOnlyFollowedByHardConstraint(sectionIR.name, constantStringArrayGrabber(sectionIR.allowedFollowingSections)))
				}
			}
		}
		//console.log([parsedSections, sectionConstraints])
		return [parsedSections, sectionConstraints]
	}

	
		const errors = errorsInAppState(appState)
		if (errors.length > 0) {
			alert(errors.join("\n"))
			return
		}
		
		try {
			const {parsedChordPrototypes, chordPrototypeConstraints} = parseChordPrototypes(chordPrototypes)
			const [parsedSections, sectionConstraints] = parseSections()

		//	console.log(numChords)

			

			const noteArray = new InfiniteArray<OctavedNote[]>()
			const chordArray = new InfiniteArray<Chordesque[]>()
			let noteIndex = 0
			let chordIndex = 0
			for (const measure of notes){
				for (const note of measure.notes){
					if (isNoteData(note)){
					
						const OctavedNoteArray: OctavedNote[] = []
						const parsed = parseOctavedNoteIR(note.pitch)
						if (parsed){
							OctavedNoteArray.push(OctavedNote.fromIR(parsed))
						}
						noteArray.set(noteIndex, OctavedNoteArray)
						noteIndex++;
					} 
					else if (isChordData(note)){
						
						const innerChordArray: Chord[] = []
						const parsed = parseOctavedNoteIR(note.root)
						if (parsed){
							const numbers: number[] = []
							for (const pitch in note.pitches){
								const innerParsed = parseOctavedNoteIR(pitch)
								if (innerParsed){
									const num = noteToInt(OctavedNote.fromIR(innerParsed).getNote())
									numbers.push(num)
								}
							}
							const chord = new Chord(OctavedNote.fromIR(parsed).getNote(),numbers)
							innerChordArray.push(chord)
							chordArray.set(chordIndex, innerChordArray)
						}
					}
				}
				
				//const key = new MusicalKey()
			}


			const noteCanvasProps: TileCanvasProps<OctavedNote> = {
				optionsPerCell: new OptionsPerCell(OctavedNote.all(), noteArray),
				constraints: new ConstraintSet(noteConstraintSet.map(noteConstraint => convertIRToNoteConstraint(noteConstraint))),
			}


			const chordesqueCanvasProps: TileCanvasProps<Chordesque> = {
				optionsPerCell: new OptionsPerCell(Chord.allBasicChords(), chordesqueIRMapToChordesqueMap(chordOptionsPerCell, chordPrototypes)),
				constraints: new ConstraintSet([...chordConstraintSet.map(chordConstraint => convertIRToChordConstraint(chordConstraint)), ...chordPrototypeConstraints]),
			}

			const sectionCanvasProps : TileCanvasProps<Section> = {
				optionsPerCell: new OptionsPerCell(parsedSections, sectionIRMapToSectionMap(sectionOptionsPerCell, sections, chordPrototypes, onlyUseChordPrototypes)),
				constraints: new ConstraintSet(sectionConstraints),
			}
			const inferredKey = inferKey()

			const node = new SectionLevelNode({
				noteCanvasProps,
				chordesqueCanvasProps,
				sectionCanvasProps,
				random: new Random(),
				higherValues: {
					key: inferredKey, 
					melodyKey: differentMelodyKey ? inferMelodyKey() : inferredKey,
					bpm,
					useRhythm,
					numChords,
					numSections: 1,
					melodyLength,
					rhythmPatternOptions: {
						minimumNumberOfNotes: minNumNotes,
						onlyStartOnNote: startOnNote,
						maximumRestLength: maxRestLength,
					},
				},
				
			})

			

			let hierarchyConstraints = new ConstraintSet<Section>()
			hierarchyConstraints.addConstraints(sectionConstraints)
			//const constraintHierarchy = new ConstraintHierarchy(parsedSections, node, hierarchyConstraints, node.getHigherValues())
		
		//	console.log(constraintHierarchy.check())
			console.log(node)
			const generatedNotes = node.generate()
			//console.log(generatedNotes[0])
			setOutput(generatedNotes)
		} catch (e) {
			console.error(e)
			alert(e)
		}
	
}
function parseNotesToTileCanvasProps(notes: (NoteData | ChordData)[]): { noteProps: TileCanvasProps<OctavedNote>[], chordProps: TileCanvasProps<Chordesque>[] } {
   	
	const noteOptionsPerCell = new InfiniteArray<OctavedNote[]>();
    const noteConstraints: NoteConstraintIR[] = [];
	let chordAmount: number = 0
	let noteAmount = 0
    const chordOptionsPerCell = new InfiniteArray<Chord[]>();
    const chordConstraints: ChordConstraintIR[] = [];

    notes.forEach((note, index) => {
        if (note.is_chord) {
            const chordData = note as ChordData;
			const notes_temp = chordData.pitches.map(pitch => parseOctavedNoteIR(pitch)).filter(note => note !== undefined) as OctavedNoteIR[];
			const chord = new Chord(
				parseOctavedNoteIR(chordData.pitches[0])!.note, 
				notes_temp.map(note => note.octave)
			);
			chordAmount++
			chordOptionsPerCell.set(index, [chord]);
			
        } else {
			noteAmount++
            const noteData = note as NoteData;
            const octavedNoteIR = parseOctavedNoteIR(noteData.pitch);
            if (octavedNoteIR) {
                noteOptionsPerCell.set(index, [new OctavedNote(octavedNoteIR.note, octavedNoteIR.octave)]);
            }
        }
    });

    const noteProps: TileCanvasProps<OctavedNote> = {
        optionsPerCell: new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell),
        constraints: new ConstraintSet(noteConstraints.map(convertIRToNoteConstraint))
    };

    const chordProps: TileCanvasProps<Chordesque> = {
        optionsPerCell: new OptionsPerCell(Chord.allBasicChords(), chordOptionsPerCell),
        constraints: new ConstraintSet(chordConstraints.map(convertIRToChordConstraint))
    };
	
    return { noteProps: [noteProps].map(canvas => new TileCanvas()), chordProps: [chordProps] };
}

function parseAnalysisResultToTileCanvasProps(data: AnalysisResult): { noteProps: TileCanvasProps<OctavedNote>[], chordProps: TileCanvasProps<Chordesque>[] }[] {
    return data.map(note => parseNotesToTileCanvasProps(note.notes));
}

function inferAllConstraintsOnCanvases(noteCanvases: TileCanvas<OctavedNote>[], chordCanvases: TileCanvas<Chordesque>[]): void {
    noteCanvases.forEach(canvas => {
        const constraintHierarchy = new ConstraintHierarchy<OctavedNote>(canvas.getHigherValues());
        const constraints = canvas.getConstraints();
        const tiles = canvas.getTiles();
        console.log(constraintHierarchy.checkConstraintsGeneric(constraints, tiles));
    });

    chordCanvases.forEach(canvas => {
        const constraintHierarchy = new ConstraintHierarchy<Chordesque>(canvas.getHigherValues());
        const constraints = canvas.getConstraints();
        const tiles = canvas.getTiles();
        console.log(constraintHierarchy.checkConstraintsGeneric(constraints, tiles));
    }); 
}

function processMusicData(data: any) {
    // Type guard to ensure the data conforms to the AnalysisResult structure
	
    if (!isAnalysisResult(data)) {
        console.error('Invalid data format');
        return;
    }
	data.flat().forEach((measure, index) => {
        if (!measure || !measure.notes) {
            console.error(`Measure or notes undefined at index ${index}`);
            return;
        }

        console.log(`Measure ${measure.measureNumber}:`);

        measure.notes.forEach((measure_data, noteIndex) => {
            if (!measure_data) {
                console.error(`Measure data undefined at measure ${measure.measureNumber}, note index ${noteIndex}`);
                return;
            }

            console.log(`  Note index ${noteIndex}:`);
            if (measure_data.is_chord) {
                const chordData = measure_data as ChordData;
                console.log(`    Chord: Pitches=${chordData.pitches.join(", ")}, StartTime=${chordData.start_time}, Duration=${chordData.duration}`);
            } else {
                const noteData = measure_data as NoteData;
                console.log(`    Note: Pitch=${noteData.pitch}, StartTime=${noteData.start_time}, Duration=${noteData.duration}`);
            }
        });
    });
	console.log("foo")
	console.log(data)
    // Process the data as needed
    data.flat().forEach((measure) => {
        console.log(`Part ${measure}:`);
		//console.log(`Part ${measure.notes}:`);

        measure.notes.forEach((measure_data ) => {
            console.log(`  Measure ${measure.measureNumber}:`);
			if (measure_data.is_chord) {
				const chordData = measure_data as ChordData;
				console.log(`    Chord: Pitches=${chordData.pitches.join(", ")}, StartTime=${chordData.start_time}, Duration=${chordData.duration}`);
			} else {
				const noteData = measure_data as NoteData;
				console.log(`    Note: Pitch=${noteData.pitch}, StartTime=${noteData.start_time}, Duration=${noteData.duration}`);
			}
               
            
        });
    });
}

const baseDuration = (bpm: number) => 60 / bpm;

export function MidiToNoteOutput2(midiFile: ArrayBuffer): NoteOutput[] {
	//const midi2 = new music21.MIDI.Player().loadFile("foo.mid");
	//const url = new URL("src/audio/bella ciao.xml").toString
	//const midi2 = music21.converter.parse("./src/audio/bellaciao.xml")
	//const midiData = new Uint8Array(midiFile);
   // const foo = new  music21.MIDI.noteOn(0, 60, 0);
   //const s = new music21.stream.Score().;
   analyzeMidi(midiFile).then(data => {
    processMusicData(data)
}).catch(error => {
    console.error('Failed to analyze MIDI file:', error);
});
    const noteOutputs: NoteOutput[] = [];
    const midi: MidiFile = read(midiFile);
	//console.log(midi)
    let tempo = 500000; // default tempo (120 BPM)
    let timeSignature = { numerator: 4, denominator: 4 }; // default time signature
    const ticksPerBeat = midi.header.ticksPerBeat;

    // Extract tempo and time signature events
    midi.tracks.forEach(track => {
        track.forEach(event => {
            if (event.type === "meta" && event.subtype === "setTempo") {
                tempo = event.microsecondsPerBeat;
            } else if (event.type === "meta" && event.subtype === "timeSignature") {
                timeSignature = {
                    numerator: event.numerator,
                    denominator: event.denominator
                };
            }
        });
    });

    
    const ticksPerMeasure = ticksPerBeat * timeSignature.numerator * (4 / timeSignature.denominator);

    midi.tracks.forEach(track => {
		const activeNotes: { [key: number]: { startTime: number; deltaTime: number } } = {};
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
                    const { startTime } = activeNotes[noteNumber];
                    const duration = currentTime - startTime;
                    const octave = Math.floor(noteNumber / 12) - 1;
                    const octavedNote = new OctavedNote(intToNote(noteNumber % 12), octave);
                    const noteOutput: NoteOutput2 = {
                        octavedNote: octavedNote,
                        startTime: startTime / (2 * ticksPerBeat),
                        duration: duration / (2 * ticksPerBeat),
                        measure: Math.floor(startTime / ticksPerMeasure)
                    };

                    noteOutputs.push(noteOutput);
                    delete activeNotes[noteNumber];
                }
            }
        });
    });
	

	console.log(noteOutputs)
    return noteOutputs;
}



export function MidiToNoteOutput(midiFile: ArrayBuffer): NoteOutput[] { 
    const noteOutputs: NoteOutput[] = [];
	//const textEncoder = new TextEncoder()
    //console.log(new ArrayBuffer(midiFile))
	//const encoded = textEncoder.encode(midiFile)
	//const parsed = midiManager.parseMidi(midiFile);
	//const midi = read(encoded)
	const midi = read(midiFile)
	console.log("downloaded midi")
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



export function noteOutputToTileCanvas(noteOutput: NoteOutput[], constraints: ConstraintSet<NoteOutput>): void {
	
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

