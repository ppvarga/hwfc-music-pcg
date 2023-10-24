import { Chord } from "../music_theory/Chord"
import { MusicalKey } from "../music_theory/MusicalKey"
import { RhythmPattern } from "../music_theory/Rhythm"
import { Section } from "../wfc/hierarchy/Section"

interface HigherValuesProps {
	key?: MusicalKey
	melodyKey?: MusicalKey
	section?: Section
	chord?: Chord
	rhythmPattern?: RhythmPattern
}

export class HigherValues {
	private key!: MusicalKey
	private melodyKey!: MusicalKey
	private section!: Section
	private chord!: Chord
	private rhythmPattern!: RhythmPattern

	constructor(props?: HigherValuesProps) {
		if (props) {
			if (props.key) this.key = props.key
			if (props.section) this.section = props.section
			if (props.chord) this.chord = props.chord
			if (props.rhythmPattern) this.rhythmPattern = props.rhythmPattern

			if (props.melodyKey) this.melodyKey = props.melodyKey
			else this.melodyKey = this.key
		}
	}

	public copy(): HigherValues {
		const out = new HigherValues()
		out.setKey(this.key)
		out.setMelodyKey(this.melodyKey)
		out.setSection(this.section)
		out.setChord(this.chord)
		out.setRhythmPattern(this.rhythmPattern)
		return out
	}

	public copyWithChord(otherChord: Chord): HigherValues {
		const out = new HigherValues()
		out.setKey(this.key)
		out.setMelodyKey(this.melodyKey)
		out.setSection(this.section)
		out.setChord(otherChord)
		out.setRhythmPattern(this.rhythmPattern)
		return out
	}

	public copyWithSection(otherSection: Section): HigherValues {
		const out = new HigherValues()
		out.setKey(this.key)
		out.setMelodyKey(this.melodyKey)
		out.setSection(otherSection)
		out.setChord(this.chord)
		out.setRhythmPattern(this.rhythmPattern)
		return out
	}

	public copyWithKey(otherKey: MusicalKey): HigherValues {
		const out = new HigherValues()
		out.setKey(otherKey)
		out.setMelodyKey(otherKey)
		out.setSection(this.section)
		out.setChord(this.chord)
		out.setRhythmPattern(this.rhythmPattern)
		return out
	}

	public copyWithMelodyKey(otherMelodyKey: MusicalKey): HigherValues {
		const out = new HigherValues()
		out.setKey(this.key)
		out.setMelodyKey(otherMelodyKey)
		out.setSection(this.section)
		out.setChord(this.chord)
		out.setRhythmPattern(this.rhythmPattern)
		return out
	}

	public copyWithRhythmPattern(
		otherRhythmPattern: RhythmPattern,
	): HigherValues {
		const out = new HigherValues()
		out.setKey(this.key)
		out.setMelodyKey(this.melodyKey)
		out.setSection(this.section)
		out.setChord(this.chord)
		out.setRhythmPattern(otherRhythmPattern)
		return out
	}

	public getKey(): MusicalKey {
		return this.key
	}

	public getMelodyKey(): MusicalKey {
		return this.melodyKey
	}

	public setKey(key: MusicalKey): void {
		this.key = key
	}

	public setMelodyKey(melodyKey: MusicalKey): void {
		this.melodyKey = melodyKey
	}

	public getSection(): Section {
		return this.section
	}

	public setSection(section: Section): void {
		this.section = section
	}

	public getChord(): Chord {
		return this.chord
	}

	public setChord(chord: Chord): void {
		this.chord = chord
	}

	public getRhythmPattern(): RhythmPattern {
		return this.rhythmPattern
	}

	public setRhythmPattern(rhythmPattern: RhythmPattern): void {
		this.rhythmPattern = rhythmPattern
	}
}
