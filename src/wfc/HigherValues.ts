import { Chord } from "../music_theory/Chord"
import { MusicalKey } from "../music_theory/MusicalKey"
import { RhythmPattern } from "../music_theory/Rhythm"
import { Section } from "../wfc/hierarchy/Section"

export interface HigherValues {
	key: MusicalKey
	melodyKey: MusicalKey
	section?: Section
	chord?: Chord
	rhythmPattern?: RhythmPattern
}
