import { MusicalKey } from "../../music_theory/MusicalKey"
import { OctavedNote } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { constantGrabber } from "../grabbers/constantGrabbers"
import { Chordesque } from "../hierarchy/prototypes"
import { AscendingMelodySoftConstraint, AscendingMelodySoftConstraintIR, AscendingMelodySoftConstraintInit } from "./AscendingMelodySoftConstraint"
import { ChordInKeyHardConstraint, ChordInKeyHardConstraintIR, ChordInKeyHardConstraintInit } from "./ChordInKeyHardConstraint"
import { ChordRootAbsoluteStepSizeHardConstraint, ChordRootAbsoluteStepSizeHardConstraintIR, ChordRootAbsoluteStepSizeHardConstraintInit } from "./ChordRootAbsoluteStepSizeHardConstraint"
import { DescendingMelodySoftConstraint, DescendingMelodySoftConstraintIR, DescendingMelodySoftConstraintInit } from "./DescendingMelodySoftConstraint"
import { MelodyAbsoluteStepSizeHardConstraint, MelodyAbsoluteStepSizeHardConstraintIR, MelodyAbsoluteStepSizeHardConstraintInit } from "./MelodyAbsoluteStepSizeHardConstraint"
import { MelodyEndsOnNoteHardConstraint, MelodyEndsOnNoteHardConstraintIR, MelodyEndsOnNoteHardConstraintInit } from "./MelodyEndsOnNoteHardConstraint"
import { MelodyInRangeHardConstraint, MelodyInRangeHardConstraintIR, MelodyInRangeHardConstraintInit } from "./MelodyInRangeHardConstraint"
import { MelodyShapeHardConstraint, MelodyShapeHardConstraintIR, MelodyShapeHardConstraintInit } from "./MelodyShapeHardConstraint"
import { MelodyStartsOnNoteHardConstraint, MelodyStartsOnNoteHardConstraintIR, MelodyStartsOnNoteHardConstraintInit } from "./MelodyStartsOnNoteHardConstraint"
import { NoteInKeyHardConstraint, NoteInKeyHardConstraintIR, NoteInKeyHardConstraintInit } from "./NoteInKeyHardConstraint"
import { PerfectCadenceSoftConstraintIR, PerfectCadenceSoftConstraintInit } from "./cadences/PerfectCadenceSoftConstraint"
import { PlagalCadenceSoftConstraint, PlagalCadenceSoftConstraintIR, PlagalCadenceSoftConstraintInit } from "./cadences/PlagalCadenceSoftConstraint"
import { Constraint } from "./concepts/Constraint"


export type ChordConstraintIR =
	| ChordInKeyHardConstraintIR
	| ChordRootAbsoluteStepSizeHardConstraintIR
	| PlagalCadenceSoftConstraintIR
	| PerfectCadenceSoftConstraintIR

export type NoteConstraintIR =
	| AscendingMelodySoftConstraintIR
	| DescendingMelodySoftConstraintIR
	| MelodyAbsoluteStepSizeHardConstraintIR
	| MelodyEndsOnNoteHardConstraintIR
	| MelodyStartsOnNoteHardConstraintIR
	| MelodyInRangeHardConstraintIR
	| MelodyShapeHardConstraintIR
	| NoteInKeyHardConstraintIR
	
export type ChordConstraintType = ChordConstraintIR["type"]
export type NoteConstraintType = NoteConstraintIR["type"]

const chordConstraintTypesAndNames = [
	["ChordInKeyHardConstraint", "Chord in Key"],
	["ChordRootAbsoluteStepSizeHardConstraint", "Chord root absolute step size"],
	["PlagalCadenceSoftConstraint", "Plagal Cadence"],
	["PerfectCadenceSoftConstraint", "Perfect Cadence"],
] as const

type ChordConstraintName = typeof chordConstraintTypesAndNames[number][1]

export const chordConstraintTypeToName = new Map<ChordConstraintType, ChordConstraintName>(chordConstraintTypesAndNames)

export const chordConstraintOptions = Array.from(chordConstraintTypeToName.entries()).map(([value, label]) => ({ value, label }))

const noteConstraintTypesAndNames = [
	["NoteInKeyHardConstraint", "Note in Key"],
	["MelodyAbsoluteStepSizeHardConstraint", "Melody absolute step size"],
	["AscendingMelodySoftConstraint", "Ascending Melody"],
	["DescendingMelodySoftConstraint", "Descending Melody"],
	["MelodyEndsOnNoteHardConstraint", "Melody ends on note"],
	["MelodyStartsOnNoteHardConstraint", "Melody starts on note"],
	["MelodyInRangeHardConstraint", "Melody in range"],
	["MelodyShapeHardConstraint", "Melody shape"],
] as const

type NoteConstraintName = typeof noteConstraintTypesAndNames[number][1]

export const noteConstraintTypeToName = new Map<NoteConstraintType, NoteConstraintName>(noteConstraintTypesAndNames)

export const noteConstraintOptions = Array.from(noteConstraintTypeToName.entries()).map(([value, label]) => ({ value, label }))

type ConstraintTextConfigResult = undefined | string
export const constraintTextConfig = (constraintType: string) : ConstraintTextConfigResult => {
	switch (constraintType) {
		case "ChordInKeyConstraint": return undefined
		case "ChordRootAbsoluteStepSizeHardConstraint": return "Allowed intervals in semitones, separated by spaces"
		case "PlagalCadenceSoftConstraint": return "Amount of boost"
		case "PerfectCadenceSoftConstraint": return "Amount of boost"
		case "NoteInKeyHardConstraint": return undefined
		case "MelodyAbsoluteStepSizeHardConstraint": return "Allowed intervals in semitones, separated by spaces"
		case "AscendingMelodySoftConstraint": return "Amount of boost"
		case "DescendingMelodySoftConstraint": return "Amount of boost"
		case "MelodyEndsOnNoteHardConstraint": return undefined
		case "MelodyStartsOnNoteHardConstraint": return undefined
		case "MelodyInRangeHardConstraint": return "Lowest note and highest note separated by a space"
		default: throw new Error(`Unknown constraint type: ${constraintType}`)
	}
}

interface ConversionProps {
	keyGrabber: Grabber<MusicalKey>
}
type ChordConversionProps = {
	ir: ChordConstraintIR
} & ConversionProps

export const convertIRToChordConstraint = ({ir, keyGrabber}: ChordConversionProps) : Constraint<Chordesque> => {
	switch (ir.type) {
		case "ChordInKeyHardConstraint": return new ChordInKeyHardConstraint(keyGrabber)
		case "ChordRootAbsoluteStepSizeHardConstraint": return new ChordRootAbsoluteStepSizeHardConstraint(constantGrabber(new Set(ir.stepSizes)))
		case "PlagalCadenceSoftConstraint": return new PlagalCadenceSoftConstraint(ir.bonus, keyGrabber)
		case "PerfectCadenceSoftConstraint": return new PlagalCadenceSoftConstraint(ir.bonus, keyGrabber)
	}
}

type NoteConversionProps = {
	ir: NoteConstraintIR
} & ConversionProps

export const convertIRToNoteConstraint = ({ir, keyGrabber}: NoteConversionProps) : Constraint<OctavedNote> => {
	switch (ir.type) {
		case "NoteInKeyHardConstraint": return new NoteInKeyHardConstraint(keyGrabber)
		case "MelodyAbsoluteStepSizeHardConstraint": return new MelodyAbsoluteStepSizeHardConstraint(constantGrabber(new Set(ir.stepSizes)))
		case "AscendingMelodySoftConstraint": return new AscendingMelodySoftConstraint(ir.bonus)
		case "DescendingMelodySoftConstraint": return new DescendingMelodySoftConstraint(ir.bonus)
		case "MelodyEndsOnNoteHardConstraint": return new MelodyEndsOnNoteHardConstraint(ir.noteGrabber)
		case "MelodyStartsOnNoteHardConstraint": return new MelodyStartsOnNoteHardConstraint(ir.noteGrabber)
		case "MelodyInRangeHardConstraint": return new MelodyInRangeHardConstraint(constantGrabber(OctavedNote.fromIR(ir.lowerNoteIR)), constantGrabber(OctavedNote.fromIR(ir.higherNoteIR)))
		case "MelodyShapeHardConstraint": return new MelodyShapeHardConstraint(constantGrabber(ir.shape))
	}
}

export const initializeChordConstraint = (name: ChordConstraintType) : ChordConstraintIR => {
	switch (name) {
		case "ChordInKeyHardConstraint": return ChordInKeyHardConstraintInit
		case "ChordRootAbsoluteStepSizeHardConstraint": return ChordRootAbsoluteStepSizeHardConstraintInit
		case "PlagalCadenceSoftConstraint": return PlagalCadenceSoftConstraintInit
		case "PerfectCadenceSoftConstraint": return PerfectCadenceSoftConstraintInit
	}
}

export const initializeNoteConstraint = (name: NoteConstraintType) : NoteConstraintIR => {
	switch (name) {
		case "NoteInKeyHardConstraint": return NoteInKeyHardConstraintInit
		case "MelodyAbsoluteStepSizeHardConstraint": return MelodyAbsoluteStepSizeHardConstraintInit
		case "AscendingMelodySoftConstraint": return AscendingMelodySoftConstraintInit
		case "DescendingMelodySoftConstraint": return DescendingMelodySoftConstraintInit
		case "MelodyEndsOnNoteHardConstraint": return MelodyEndsOnNoteHardConstraintInit
		case "MelodyStartsOnNoteHardConstraint": return MelodyStartsOnNoteHardConstraintInit
		case "MelodyInRangeHardConstraint": return MelodyInRangeHardConstraintInit
		case "MelodyShapeHardConstraint": return MelodyShapeHardConstraintInit
	}
}
