import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { MusicalKey } from "./music_theory/MusicalKey"
import { Note, OctavedNote } from "./music_theory/Note"
import { SelectKeyTypeOption } from "./components/utils"
import { ChordInKeyHardConstraintInit } from "./wfc/constraints/ChordInKeyHardConstraint"
import { MelodyInKeyHardConstraintInit } from "./wfc/constraints/MelodyInKeyHardConstraint"
import { MelodyInRangeHardConstraintInit } from "./wfc/constraints/MelodyInRangeHardConstraint"
import { ChordConstraintIR, NoteConstraintIR } from "./wfc/constraints/constraintUtils"
import { ChordRootAbsoluteStepSizeHardConstraintInit } from "./wfc/constraints/ChordRootAbsoluteStepSizeHardConstraint"
import { ChordPrototypeIR, ChordesqueIR } from "./wfc/hierarchy/prototypes"
import { NoteOutput } from "./components/MidiPlayer"

function AppState() {
	//GLOBAL LENGTHS
	const [numChords, setNumChords] = useState(4)
	const [melodyLength, tempSetMelodyLength] = useState(4)
	const setMelodyLength = (newLength: number) => {
		tempSetMelodyLength(newLength)
	}

	//GLOBAL KEY
	const [keyRoot, setKeyRoot] = useState(Note.C)
	const [keyType, setKeyType] = useState({label: "Major", value: "major"} as SelectKeyTypeOption)
	const inferKey = useCallback(() => {
		if(keyType === null) throw new Error("keyType and keyRoot must be defined")
		return MusicalKey.fromRootAndType(keyRoot, keyType.value)
	}, [keyRoot, keyType])
	const inferKeyRef = useRef(inferKey)
	useEffect(() => {
		inferKeyRef.current = inferKey
	}, [inferKey])
	const keyGrabber = () => inferKeyRef.current()

	const [differentMelodyKey, setDifferentMelodyKey] = useState(false)
	const [melodyKeyRoot, setMelodyKeyRoot] = useState(Note.C)
	const [melodyKeyType, setMelodyKeyType] = useState({label: "Major", value: "major"} as SelectKeyTypeOption)
	const inferMelodyKey = useCallback(() => {
		if(melodyKeyType === null) throw new Error("keyType and keyRoot must be defined")
		return MusicalKey.fromRootAndType(melodyKeyRoot, melodyKeyType.value)
	}, [melodyKeyRoot, melodyKeyType])
	const inferMelodyKeyRef = useRef(inferMelodyKey)
	useEffect(() => {
		inferMelodyKeyRef.current = inferMelodyKey
	}, [inferMelodyKey])
	const melodyKeyGrabber = () => inferMelodyKeyRef.current()
	
	//OPTIONS PER CELL
	const [chordOptionsPerCell, setChordOptionsPerCell] = useState(new Map<number, ChordesqueIR[]>())
	const handleChordOptionsPerCellChange = (index: number, chordOptions: ChordesqueIR[]) => {
		const newOptionsPerCell = new Map(chordOptionsPerCell)
		newOptionsPerCell.set(index, chordOptions)
		setChordOptionsPerCell(newOptionsPerCell)
	}

	const [noteOptionsPerCell, setNoteOptionsPerCell] = useState(new Map<number, OctavedNote[]>())
	const handleNoteOptionsPerCellChange = (index: number, noteOptions: OctavedNote[]) => {
		const newOptionsPerCell = new Map(noteOptionsPerCell)
		newOptionsPerCell.set(index, noteOptions)
		setNoteOptionsPerCell(newOptionsPerCell)
	}

	//CONSTRAINTS
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

	const basicNoteConstraintSet = [MelodyInKeyHardConstraintInit, MelodyInRangeHardConstraintInit] as NoteConstraintIR[]
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
	
	//RHYTHM
	const [useRhythm, setUseRhythm] = useState(false)
	
	const [minNumNotes, tempSetMinNumNotes] = useState(3)
	const setMinNumNotes = (newMinNumNotes: number) => {
		tempSetMinNumNotes(newMinNumNotes)
	}
	const [maxRestLength, tempSetMaxRestLength] = useState(1)
	const setMaxRestLength = (newMaxRestLength: number) => {
		tempSetMaxRestLength(newMaxRestLength)
	}
	const [startOnNote, tempSetStartOnNote] = useState(true)
	const setStartOnNote = (newStartOnNote: boolean) => {
		tempSetStartOnNote(newStartOnNote)
	}

	//PROTOTYPES
	const [onlyUseChordPrototypes, setOnlyUseChordPrototypes] = useState(false)
	const [chordPrototypes, setChordPrototypes] = useState<ChordPrototypeIR[]>([])
	const addChordPrototype = (prototype: ChordPrototypeIR) => {
		setChordPrototypes([...chordPrototypes, prototype])
	}
	const removeChordPrototype = (index: number) => {
		const newPrototypes = [...chordPrototypes]
		newPrototypes.splice(index, 1)
		setChordPrototypes(newPrototypes)
		if(newPrototypes.length === 0) {
			setOnlyUseChordPrototypes(false)
		}
	}
	const handleChordPrototypeChange = (index: number, prototype: ChordPrototypeIR) => {
		const newPrototypes = [...chordPrototypes]
		newPrototypes[index] = prototype
		setChordPrototypes(newPrototypes)
	}

	const [nextChordPrototypeID, setNextChordPrototypeID] = useState(1)
	const getNextChordPrototypeID = () => {
		const id = nextChordPrototypeID
		setNextChordPrototypeID(nextChordPrototypeID + 1)
		return id
	}  

	const [chordPrototypeAllowedNeighbors, setChordPrototypeAllowedNeighbors] = useState([] as [number, number][])
	const addChordPrototypeAllowedNeighbor = (neighborPair: [number, number]) => {
		setChordPrototypeAllowedNeighbors([...chordPrototypeAllowedNeighbors, neighborPair])
	}
	const removeChordPrototypeAllowedNeighbor = (neighborPair: [number, number]) => {
		const newNeighbors = [...(chordPrototypeAllowedNeighbors.filter(pair => pair !== neighborPair))]
		setChordPrototypeAllowedNeighbors(newNeighbors)
	}

	//OUTPUT
	const [output, setOutput] = useState<[NoteOutput[], number]>([[], 0])

	return {
		numChords,
		setNumChords,

		melodyLength,
		setMelodyLength,

		keyRoot,
		setKeyRoot,
		keyType,
		setKeyType,
		inferKey,
		keyGrabber,

		differentMelodyKey,
		setDifferentMelodyKey,
		melodyKeyRoot,
		setMelodyKeyRoot,
		melodyKeyType,
		setMelodyKeyType,
		inferMelodyKey,
		melodyKeyGrabber,

		chordOptionsPerCell,
		handleChordOptionsPerCellChange,

		noteOptionsPerCell,
		handleNoteOptionsPerCellChange,

		chordConstraintSet,
		addChordConstraint,
		removeChordConstraint,
		handleChordConstraintChange,

		noteConstraintSet,
		addNoteConstraint,
		removeNoteConstraint,
		handleNoteConstraintChange,
		
		useRhythm,
		setUseRhythm,
		minNumNotes,
		setMinNumNotes,
		startOnNote,
		setStartOnNote,
		maxRestLength,
		setMaxRestLength,

		chordPrototypes,
		addChordPrototype,
		removeChordPrototype,
		handleChordPrototypeChange,
		getNextChordPrototypeID,
		addChordPrototypeAllowedNeighbor,
		removeChordPrototypeAllowedNeighbor,
		onlyUseChordPrototypes,
		setOnlyUseChordPrototypes,

		output,
		setOutput,

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

type ChordPrototypeEnvironment = {
	noteOptionsPerCell: Map<number, OctavedNote[]>,
	handleNoteOptionsPerCellChange: (index: number, noteOptions: OctavedNote[]) => void,
	melodyLength: number,
	setMelodyLength: (newLength: number) => void,
	noteConstraintSet: NoteConstraintIR[],
	addNoteConstraint: (constraint: NoteConstraintIR) => void,
	removeNoteConstraint: (index: number) => void,
	handleNoteConstraintChange: (index: number, constraint: NoteConstraintIR) => void,
	minNumNotes: number,
	setMinNumNotes: (newMinNumNotes: number) => void,
	startOnNote: boolean,
	setStartOnNote: (newStartOnNote: boolean) => void,
	maxRestLength: number,
	setMaxRestLength: (newMaxRestLength: number) => void,
}

export const ChordPrototypeProvider = ({ children, env }: { children: React.ReactNode, env: ChordPrototypeEnvironment }) => {
	const appState = useAppContext()
	const newState = {...appState, ...env}
	return <AppContext.Provider value={newState}>{children}</AppContext.Provider>
}
