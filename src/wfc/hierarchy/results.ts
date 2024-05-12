import { Chord } from "../../music_theory/Chord"
import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
import { Canvasable } from "../../util/utils"
import { Chordesque } from "./Chordesque"
import { Section } from "./Section"

export type ChordResult = Result<Chordesque> & {
	chord: Chord
	notes: OctavedNote[]
}

export type ChordResultWithRhythm = ChordResult & {
	rhythmPattern: RhythmPattern
}

export type SectionResult = Result<Section> & ChordResult[]

export type SectionResultWithRhythm = Result<Section> & ChordResultWithRhythm[]

export type MelodyResult = Result<OctavedNote> & OctavedNote[]

export interface Result<T extends Canvasable> {}
