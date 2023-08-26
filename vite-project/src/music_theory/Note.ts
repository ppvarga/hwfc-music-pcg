//type Note = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"
export enum Note {
  C = "C",
  CSharp = "C#",
  D = "D",
  DSharp = "D#",
  E = "E",
  F = "F",
  FSharp = "F#",
  G = "G",
  GSharp = "G#",
  A = "A",
  ASharp = "A#",
  B = "B"
}

export function relativeNote(note: Note, interval: number): Note {
	const notes = Object.values(Note)
	const index = notes.indexOf(note)
	const newIndex = (index + interval) % notes.length
	return notes[newIndex]
}

export function noteToInt(note: Note): number {
	return Object.values(Note).indexOf(note)
}

export function intToNote (value: number): Note {
	return Object.values(Note)[value]
}

export function noteDistance(first: Note, second: Note): number {
	let diff = noteToInt(second) - noteToInt(first)
	if(diff < -5) diff += 12
	if(diff > 6) diff -= 12
	return diff
}

export function noteDistanceAbs(first: Note, second: Note): number {
	return Math.abs(noteDistance(first, second))
}

export type OctavedNoteIR = {
	note: Note
	octave: number
}

export class OctavedNote {
	private note: Note
	private octave: number

	constructor(note: Note, octave: number) {
		if(octave < -1 || octave > 9) throw new Error("Octave must be between -1 and 9")
		if(octave === 9 && ["G#", "A", "A#", "B"].includes(note)) throw new Error("Octave 9 can't have notes G#, A, A# or B")
		this.note = note
		this.octave = octave
	}

	public static fromMIDIValue(midiValue: number): OctavedNote {
		if(midiValue < 0 || midiValue > 127) throw new Error("MIDI value must be between 0 and 127")
		const note = midiValue % 12
		const octave = Math.floor(midiValue / 12) - 1
		return new OctavedNote(
			Object.values(Note)[note],
			octave
		)
	}

	public toMIDIValue(): number {
		const note = Object.values(Note).indexOf(this.note)
		return (this.octave + 1) * 12 + note
	}

	public static all(): OctavedNote[] {
		const notes: OctavedNote[] = []
		for(let i = 0; i < 128; i++) {
			notes.push(OctavedNote.fromMIDIValue(i))
		}
		return notes
	}

	public getNote(): Note {
		return this.note
	}

	public getOctave(): number {  
		return this.octave
	}

	public relative(interval: number): OctavedNote {
		return OctavedNote.fromMIDIValue(this.toMIDIValue() + interval)
	}

	public static getStepSize(first: OctavedNote, second: OctavedNote): number {
		return second.toMIDIValue() - first.toMIDIValue()
	}

	public static getStepSizeAbs(first: OctavedNote, second: OctavedNote): number {
		return Math.abs(OctavedNote.getStepSize(first, second))
	}

	public static parse(note: string): OctavedNote {
		const regex = /([A-G]#?)(-?\d+)/
		const match = note.match(regex)
		if(match === null) throw new Error("Invalid note format")
		const noteName = match[1]
		if(!Object.values(Note).includes(noteName as Note)) throw new Error("Invalid note name")
		const octave = parseInt(match[2])
		return new OctavedNote(
      noteName as Note,
      octave
		)
	}

	public static parseMultiple(notes: string): OctavedNote[] {
		if(notes === "") return []
		const regex = /([A-G]#?)(-?\d+)/g
		const matches = notes.match(regex)
		if(matches === null) throw new Error("Invalid notes format")
		return matches.map((match) => OctavedNote.parse(match))
	}

	public toString(): string {
		return `${this.note}${this.octave}`
	}

	public static fromIR(ir: OctavedNoteIR): OctavedNote {
		return new OctavedNote(
			ir.note,
			ir.octave
		)
	}
}


