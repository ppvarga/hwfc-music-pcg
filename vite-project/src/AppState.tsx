import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Chord } from "./music_theory/Chord"
import { MajorKey, MinorKey } from "./music_theory/MusicalKey"
import { Note, OctavedNote } from "./music_theory/Note"
import { SelectOption } from "./components/utils"
import { ChordInKeyHardConstraintInit } from "./wfc/constraints/ChordInKeyHardConstraint"
import { NoteInKeyHardConstraintInit } from "./wfc/constraints/NoteInKeyHardConstraint"
import { MelodyInRangeHardConstraintInit } from "./wfc/constraints/MelodyInRangeHardConstraint"
import { ChordConstraintIR, NoteConstraintIR } from "./wfc/constraints/constraintUtils"
import { ChordRootAbsoluteStepSizeHardConstraintInit } from "./wfc/constraints/ChordRootAbsoluteStepSizeHardConstraint"

function AppState() {
	const [numChords, setNumChords] = useState(4)
	const [numNotesPerChord, setNumNotesPerChord] = useState(4)
	const [keyRoot, setKeyRoot] = useState(Note.C)
	const [keyType, setKeyType] = useState({label: "Major", value: "major"} as SelectOption)

	const inferKey = useCallback(() => {
		if(keyType === null) throw new Error("keyType and keyRoot must be defined")
		if (keyType.value === "major") {
			return new MajorKey(keyRoot)
		} else if (keyType.value === "minor"){
			return new MinorKey(keyRoot)
		} else {
			throw new Error("keyType must be either major or minor")
		}
	}, [keyRoot, keyType])

	const inferKeyRef = useRef(inferKey)

	useEffect(() => {
		inferKeyRef.current = inferKey
	}, [inferKey])

	const keyGrabber = () => inferKeyRef.current()

	const basicChordConstraintSet: ChordConstraintIR[] = [ChordInKeyHardConstraintInit, ChordRootAbsoluteStepSizeHardConstraintInit]

	const [chordConstraintSet, setChordConstraintSet] = useState(basicChordConstraintSet)

	const addChordConstraint = (constraint: ChordConstraintIR) => {
		setChordConstraintSet([...chordConstraintSet, constraint])
	}

	const removeChordConstraint = (index: number) => {
		const newConstraintSet = [...chordConstraintSet]
		newConstraintSet.splice(index, 1)
		setChordConstraintSet(newConstraintSet)			
	}

	const handleChordConstraintChange = (index: number, constraint: ChordConstraintIR) => {
		const newConstraintSet = [...chordConstraintSet]
		newConstraintSet[index] = constraint
		setChordConstraintSet(newConstraintSet)
	}

	const basicNoteConstraintSet = [NoteInKeyHardConstraintInit, MelodyInRangeHardConstraintInit] as NoteConstraintIR[]
	const [noteConstraintSet, setNoteConstraintSet] = useState(basicNoteConstraintSet)

	const addNoteConstraint = (constraint: NoteConstraintIR) => {
		setNoteConstraintSet([...noteConstraintSet, constraint])
	}

	const removeNoteConstraint = (index: number) => {
		const newConstraintSet = [...noteConstraintSet]
		newConstraintSet.splice(index, 1)
		setNoteConstraintSet(newConstraintSet)			
	}

	const handleNoteConstraintChange = (index: number, constraint: NoteConstraintIR) => {
		const newConstraintSet = [...noteConstraintSet]
		newConstraintSet[index] = constraint
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
		handleChordConstraintChange,
		handleNoteConstraintChange,
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

