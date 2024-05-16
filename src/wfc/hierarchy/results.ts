import { Chord } from "../../music_theory/Chord"
import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
import { Canvasable } from "../../util/utils"
import { Chordesque } from "./Chordesque"
import { Section } from "./Section"

export type EntireResult = Result<any> & SectionResult[]

export type SectionResult = Result<Section> & ChordResult[]

export type ChordResult = Result<Chordesque> & {
	chord: Chord
	notes: OctavedNote[]
	rhythmPattern: RhythmPattern
	bpm: number
}


export type MelodyResult = Result<OctavedNote> & OctavedNote

export interface Result<T extends Canvasable<T>> {}
