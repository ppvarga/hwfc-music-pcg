import { createContext, useCallback, useContext, useState } from "react"
import { MusicalKey } from "./music_theory/MusicalKey"
import { Note, OctavedNote } from "./music_theory/Note"
import { SelectKeyTypeOption } from "./components/utils"
import { ChordInKeyHardConstraintInit } from "./wfc/constraints/ChordInKeyHardConstraint"
import { MelodyInKeyHardConstraintInit } from "./wfc/constraints/MelodyInKeyHardConstraint"
import { MelodyInRangeHardConstraintInit } from "./wfc/constraints/MelodyInRangeHardConstraint"
import { ChordConstraintIR, NoteConstraintIR } from "./wfc/constraints/constraintUtils"
import { ChordRootAbsoluteStepSizeHardConstraintInit } from "./wfc/constraints/ChordRootAbsoluteStepSizeHardConstraint"
import { ChordPrototypeIR, ChordesqueIR } from "./wfc/hierarchy/Chordesque"
import { NoteOutput } from "./components/MidiPlayer"
import { SectionIR } from "./wfc/hierarchy/Section"
import { Chord } from "./music_theory/Chord"

function AppState() {
	//GLOBAL LENGTHS
	const [numChords, setNumChords] = useState(4)
	const [melodyLength, tempSetMelodyLength] = useState(4)
	const setMelodyLength = (newLength: number) => {
		tempSetMelodyLength(newLength)
	}

	//GLOBAL KEY
	const [keyRoot, setKeyRoot] = useState(Note.C)
	const [keyType, setKeyType] = useState({ label: "Major", value: "major" } as SelectKeyTypeOption)
	const inferKey = useCallback(() => {
		if (keyType === null) throw new Error("keyType and keyRoot must be defined")
		return MusicalKey.fromRootAndType(keyRoot, keyType.value)
	}, [keyRoot, keyType])

	const [differentMelodyKey, tempSetDifferentMelodyKey] = useState(false)
	const setDifferentMelodyKey = (newDifferentMelodyKey: boolean) => tempSetDifferentMelodyKey(newDifferentMelodyKey)
	const [melodyKeyRoot, tempSetMelodyKeyRoot] = useState(Note.C)
	const setMelodyKeyRoot = (newMelodyKeyRoot: Note) => tempSetMelodyKeyRoot(newMelodyKeyRoot)
	const [melodyKeyType, tempSetMelodyKeyType] = useState({ label: "Major", value: "major" } as SelectKeyTypeOption)
	const setMelodyKeyType = (newMelodyKeyType: SelectKeyTypeOption) => tempSetMelodyKeyType(newMelodyKeyType)
	const inferMelodyKey = useCallback(() => {
		if (melodyKeyType === null) throw new Error("keyType and keyRoot must be defined")
		return MusicalKey.fromRootAndType(melodyKeyRoot, melodyKeyType.value)
	}, [melodyKeyRoot, melodyKeyType])

	//OPTIONS PER CELL
	const [sectionOptionsPerCell, setSectionOptionsPerCell] = useState(new Map<number, SectionIR[]>())
	const handleSectionOptionsPerCellChange = (index: number, sectionOptions: SectionIR[]) => {
		const newOptionsPerCell = new Map(sectionOptionsPerCell)
		newOptionsPerCell.set(index, sectionOptions)
		setSectionOptionsPerCell(newOptionsPerCell)
	}

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

	//CHORD PROTOTYPES
	const [onlyUseChordPrototypes, setOnlyUseChordPrototypes] = useState(false)
	const [chordPrototypes, setChordPrototypes] = useState<ChordPrototypeIR[]>([])
	const addChordPrototype = (prototype: ChordPrototypeIR) => {
		setChordPrototypes([...chordPrototypes, prototype])
	}
	const removeChordPrototype = (index: number) => {
		const newPrototypes = [...chordPrototypes]
		newPrototypes.splice(index, 1)
		setChordPrototypes(newPrototypes)
		if (newPrototypes.length === 0) {
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

	//SECTIONS
	const [sections, setSections] = useState<SectionIR[]>([])
	const addSection = (section: SectionIR) => {
		setSections([...sections, section])
	}
	const removeSection = (index: number) => {
		const newSections = [...sections]
		newSections.splice(index, 1)
		setSections(newSections)
	}
	const handleSectionChange = (index: number, section: SectionIR) => {
		const newSections = [...sections]
		newSections[index] = section
		setSections(newSections)
	}

	const [nextSectionID, setNextSectionID] = useState(1)
	const getNextSectionID = () => {
		const id = nextSectionID
		setNextSectionID(nextSectionID + 1)
		return id
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

		differentMelodyKey,
		setDifferentMelodyKey,
		melodyKeyRoot,
		setMelodyKeyRoot,
		melodyKeyType,
		setMelodyKeyType,
		inferMelodyKey,

		sectionOptionsPerCell,
		handleSectionOptionsPerCellChange,
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
		onlyUseChordPrototypes,
		setOnlyUseChordPrototypes,

		sections,
		addSection,
		removeSection,
		handleSectionChange,
		getNextSectionID,

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

	differentMelodyKey: boolean,
	setDifferentMelodyKey: (newDifferentMelodyKey: boolean) => void,
	melodyKeyRoot: Note,
	setMelodyKeyRoot: (newMelodyKeyRoot: Note) => void,
	melodyKeyType: SelectKeyTypeOption,
	setMelodyKeyType: (newMelodyKeyType: SelectKeyTypeOption) => void,
}

type SectionEnvironment = ChordPrototypeEnvironment & {
	chordOptionsPerCell: Map<number, ChordesqueIR[]>,
	handleChordOptionsPerCellChange: (index: number, chordOptions: ChordesqueIR[]) => void,
	chordConstraintSet: ChordConstraintIR[],
	addChordConstraint: (constraint: ChordConstraintIR) => void,
	removeChordConstraint: (index: number) => void,
	handleChordConstraintChange: (index: number, constraint: ChordConstraintIR) => void,
}

export const ChordPrototypeProvider = ({ children, env }: { children: React.ReactNode, env: ChordPrototypeEnvironment }) => {
	const appState = useAppContext()
	const newState = { ...appState, ...env }
	return <AppContext.Provider value={newState}>{children}</AppContext.Provider>
}

export const SectionProvider = ({ children, env }: { children: React.ReactNode, env: SectionEnvironment }) => {
	const appState = useAppContext()
	const newState = { ...appState, ...env }
	return <AppContext.Provider value={newState}>{children}</AppContext.Provider>
}