import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Chord } from "./music_theory/Chord"
import { MajorKey, MinorKey } from "./music_theory/MusicalKey"
import { Note, OctavedNote } from "./music_theory/Note"
import { ConstraintSet } from "./wfc/ConstraintSet"
import { Constraint } from "./wfc/constraints/concepts/Constraint"
import { Chordesque } from "./wfc/hierarchy/prototypes"
import { SelectNoteOption, SelectOption } from "./components/utils"
import { ChordInKeyConstraint } from "./wfc/constraints/ChordInKeyHardConstraint"
import { NoteInKeyHardConstraint } from "./wfc/constraints/NoteInKeyHardConstraint"
import { MelodyInRangeHardConstraint } from "./wfc/constraints/MelodyInRangeHardConstraint"
import { constantGrabber } from "./wfc/grabbers/constantGrabbers"

function AppState() {
	const [numChords, setNumChords] = useState(4)
	const [numNotesPerChord, setNumNotesPerChord] = useState(4)
	const [keyRoot, setKeyRoot] = useState({label: "C", value: Note.C} as SelectNoteOption)
	const [keyType, setKeyType] = useState({label: "Major", value: "major"} as SelectOption)

	const inferKey = useCallback(() => {
		if(keyType === null || keyRoot === null) throw new Error("keyType and keyRoot must be defined")
		if (keyType.value === "major") {
			return new MajorKey(keyRoot.value)
		} else if (keyType.value === "minor"){
			return new MinorKey(keyRoot.value)
		} else {
			throw new Error("keyType must be either major or minor")
		}
	}, [keyRoot, keyType])

	const inferKeyRef = useRef(inferKey)

	useEffect(() => {
		inferKeyRef.current = inferKey
	}, [inferKey])

	const keyGrabber = {
		grab: () => inferKeyRef.current(),
		configText: () => "Global key"
	}

	const basicChordConstraintSet = new ConstraintSet<Chordesque>()
	basicChordConstraintSet.addConstraint(new ChordInKeyConstraint(keyGrabber))

	const [chordConstraintSet, setChordConstraintSet] = useState(basicChordConstraintSet)
	const addChordConstraint = (constraint: Constraint<Chordesque>) => {
		const newConstraintSet = new ConstraintSet(chordConstraintSet.getAllConstraints())
		newConstraintSet.addConstraint(constraint)
		setChordConstraintSet(newConstraintSet)
	}

	const removeChordConstraint = (constraint: Constraint<Chordesque>) => {
		const newConstraintSet = new ConstraintSet(chordConstraintSet.getAllConstraints())
		newConstraintSet.removeConstraint(constraint)
		setChordConstraintSet(newConstraintSet)
	}

	const basicNoteConstraintSet = new ConstraintSet<OctavedNote>()
	basicNoteConstraintSet.addConstraint(new NoteInKeyHardConstraint(keyGrabber))
	basicNoteConstraintSet.addConstraint(new MelodyInRangeHardConstraint(constantGrabber(new OctavedNote(Note.C, 4)), constantGrabber(new OctavedNote(Note.C, 5))))

	const [noteConstraintSet, setNoteConstraintSet] = useState(basicNoteConstraintSet)
	const addNoteConstraint = (constraint: Constraint<OctavedNote>) => {
		const newConstraintSet = new ConstraintSet(noteConstraintSet.getAllConstraints())
		newConstraintSet.addConstraint(constraint)
		setNoteConstraintSet(newConstraintSet)
	}

	const removeNoteConstraint = (constraint: Constraint<OctavedNote>) => {
		const newConstraintSet = new ConstraintSet(noteConstraintSet.getAllConstraints())
		newConstraintSet.removeConstraint(constraint)
		setNoteConstraintSet(newConstraintSet)
	}


	const [chordOptionsPerCell, setChordOptionsPerCell] = useState(new Map<number, Chord[]>())
	const [noteOptionsPerCell, setNoteOptionsPerCell] = useState(new Map<number, OctavedNote[]>())

	return {
		chordConstraintSet,
		setChordConstraintSet,
		addChordConstraint,
		numChords,
		setNumChords,
		keyRoot,
		setKeyRoot,
		keyType,
		setKeyType,
		inferKey,
		chordOptionsPerCell,
		setChordOptionsPerCell,
		noteOptionsPerCell,
		setNoteOptionsPerCell,
		numNotesPerChord,
		setNumNotesPerChord,
		removeChordConstraint,
		noteConstraintSet,
		setNoteConstraintSet,
		addNoteConstraint,
		removeNoteConstraint,
		keyGrabber,
	}
}

type AppContextType = ReturnType<typeof AppState>

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
	const context = useContext(AppContext)
	if (context === undefined) {
		throw new Error("useAppContext must be used within a AppProvider")
	}
	return context
}


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const appState = AppState()
	return <AppContext.Provider value={appState}>{children}</AppContext.Provider>
}

