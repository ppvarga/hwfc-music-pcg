export const chordConstraintTypeToName = new Map<string, string>([
	["ChordInKeyConstraint", "Chord in Key"],
	["ChordRootAbsoluteStepSizeHardConstraint", "Chord root absolute step size"],
	["PlagalCadenceSoftConstraint", "Plagal Cadence"],
	["PerfectCadenceSoftConstraint", "Perfect Cadence"],
])

export const chordConstraintOptions = Array.from(chordConstraintTypeToName.entries()).map(([value, label]) => ({ value, label }))

export const noteConstraintTypeToName = new Map<string, string>([
	["NoteInKeyHardConstraint", "Note in Key"],
	["MelodyAbsoluteStepSizeHardConstraint", "Melody absolute step size"],
	["AscendingMelodySoftConstraint", "Ascending Melody"],
	["DescendingMelodySoftConstraint", "Descending Melody"],
	["MelodyEndsOnNoteHardConstraint", "Melody ends on note"],
	["MelodyStartsOnNoteHardConstraint", "Melody starts on note"],
	["MelodyInRangeHardConstraint", "Melody in range"],
	["MelodyShapeHardConstraint", "Melody shape"],
])

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