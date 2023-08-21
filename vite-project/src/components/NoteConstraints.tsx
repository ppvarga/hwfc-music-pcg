import { useState } from "react"
import { useAppContext } from "../AppState"
import { OctavedNote } from "../music_theory/Note"
import { AscendingMelodySoftConstraint } from "../wfc/constraints/AscendingMelodySoftConstraint"
import { DescendingMelodySoftConstraint } from "../wfc/constraints/DescendingMelodySoftConstraint"
import { MelodyAbsoluteStepSizeHardConstraint } from "../wfc/constraints/MelodyAbsoluteStepSizeHardConstraint"
import { NoteInKeyHardConstraint } from "../wfc/constraints/NoteInKeyHardConstraint"
import { Constraint } from "../wfc/constraints/concepts/Constraint"
import { constantGrabber } from "../wfc/grabbers/constantGrabbers"
import Select from "react-select"
import { NoteSelector, NoteSelectorResult } from "./NoteSelector"
import { MelodyEndsOnNoteHardConstraint } from "../wfc/constraints/MelodyEndsOnNoteHardConstraint"
import { MelodyStartsOnNoteHardConstraint } from "../wfc/constraints/MelodyStartsOnNoteHardConstraint"
import { MelodyInRangeHardConstraint } from "../wfc/constraints/MelodyInRangeHardConstraint"
import { constraintTextConfig, noteConstraintOptions } from "../wfc/constraints/constraintUtils"
import { selectStyles } from "../styles"
import { SelectOption } from "./utils"

function NoteConstraintDiv({constraint}: {constraint: Constraint<OctavedNote>}) {
	const {removeNoteConstraint} = useAppContext()

	return <div className="note-constraint-div">
		<h5>{constraint.name}</h5>
		<p>{constraint.configText()}</p>
		<button onClick={() => removeNoteConstraint(constraint)}>Remove</button>
	</div>
}

export function NoteConstraints() {
	const {noteConstraintSet} = useAppContext()
	return <>
		<h3>Note constraints</h3>
		{noteConstraintSet.getAllConstraints().map((constraint, i) => <NoteConstraintDiv key={i} constraint={constraint}/>)}
	</>
}

export function AddNoteConstraint() {

	const {keyGrabber, addNoteConstraint, noteConstraintSet} = useAppContext()
    
	const [noteConstraintConfigHidden, setNoteConstraintConfigHidden] = useState(true)
	const [noteConstraintButtonHidden, setNoteConstraintButtonHidden] = useState(true)
	const [noteConstraintConfigPlaceholder, setNoteConstraintConfigPlaceholder] = useState("")
	const [noteConstraintConfig, setNoteConstraintConfig] = useState("")
	const [addNoteConstraintCallback, setAddNoteConstraintCallback] = useState(() => (_config: string, _noteSelectorValue: NoteSelectorResult) => {})
	const [noteConstraintSelected, setNoteConstraintSelected] = useState(null as SelectOption)

	const addNoteConstraintButtonCallback = () => {
		addNoteConstraintCallback(noteConstraintConfig, noteSelectorValue)
		setNoteConstraintConfig("")
		setNoteConstraintConfigHidden(true)
		setNoteConstraintButtonHidden(true)
		setNoteConstraintSelected(null)
	}

	const getNoteConstraintOptions = () => noteConstraintOptions.filter(option => !noteConstraintSet.getAllConstraints().map(constraint => constraint.name).includes(option.label))

	const [noteSelectorHidden, setNoteSelectorHidden] = useState(true)
	const [noteSelectorValue, setNoteSelectorValue] = useState(null as NoteSelectorResult)

	function updateNoteConstraintAdder(value: string | undefined) {
		if(value === undefined) {
			setNoteConstraintConfigHidden(true)
			setNoteConstraintButtonHidden(true)
			setNoteSelectorHidden(true)
			setNoteConstraintConfigPlaceholder("")
			setAddNoteConstraintCallback(() => () => {})
			return
		}

		setNoteConstraintButtonHidden(false)

		const configPlaceholder = constraintTextConfig(value)
		if(configPlaceholder === undefined){
			setNoteConstraintConfigHidden(true)
			setNoteConstraintConfigPlaceholder("")
		} else {
			setNoteConstraintConfigHidden(false)
			setNoteConstraintConfigPlaceholder(configPlaceholder)
		}

		switch(value) {
		case "NoteInKeyHardConstraint":
			setNoteSelectorHidden(true)
			setAddNoteConstraintCallback(() => () => addNoteConstraint(new NoteInKeyHardConstraint(keyGrabber)))
			break
		case "AscendingMelodySoftConstraint":
			setNoteSelectorHidden(true)
			setAddNoteConstraintCallback(() => (config: string) => {
				const boost = parseInt(config)
				if(boost !== 0){
					addNoteConstraint(new AscendingMelodySoftConstraint(parseInt(config)))
					setNoteConstraintConfigHidden(true)
					setNoteConstraintConfig("")
				}
			})
			break
		case "DescendingMelodySoftConstraint":
			setNoteSelectorHidden(true)
			setAddNoteConstraintCallback(() => (config: string) => {
				const boost = parseInt(config)
				if(boost !== 0){
					addNoteConstraint(new DescendingMelodySoftConstraint(parseInt(config)))
					setNoteConstraintConfigHidden(true)
					setNoteConstraintConfig("")
				}
			})
			break
		case "MelodyAbsoluteStepSizeHardConstraint":
			setNoteSelectorHidden(true)
			setAddNoteConstraintCallback(() => (config: string) => {
				const intervals = new Set(config.split(" ").map(str => parseInt(str)))
				if(intervals.size !== 0){
					addNoteConstraint(new MelodyAbsoluteStepSizeHardConstraint(constantGrabber(intervals)))
					setNoteConstraintConfigHidden(true)
					setNoteConstraintConfig("")
				}
			})
			break
		case "MelodyEndsOnNoteHardConstraint":
			setNoteSelectorHidden(false)
			setAddNoteConstraintCallback(() => (_config: string, noteSelectorValue: NoteSelectorResult) => {
				if(noteSelectorValue !== null) {
					addNoteConstraint(new MelodyEndsOnNoteHardConstraint(noteSelectorValue))
					setNoteSelectorHidden(true)
					//setNoteSelectorValue(null)
				}
			})
			break
		case "MelodyStartsOnNoteHardConstraint":
			setNoteSelectorHidden(false)
			setAddNoteConstraintCallback(() => (_config: string, noteSelectorValue: NoteSelectorResult) => {
				if(noteSelectorValue !== null) {
					addNoteConstraint(new MelodyStartsOnNoteHardConstraint(noteSelectorValue))
					setNoteSelectorHidden(true)
					//setNoteSelectorValue(null)
				}
			})
			break
		case "MelodyInRangeHardConstraint":
			setNoteSelectorHidden(true)
			setAddNoteConstraintCallback(() => (config: string) => {
				const [low, high] = config.split(" ").map(str => OctavedNote.parse(str))
				addNoteConstraint(new MelodyInRangeHardConstraint(constantGrabber(low), constantGrabber(high)))
			})
			break
			// case "MelodyShapeHardConstraint":
			//   setNoteConstraintConfigHidden(false)
			//   setNoteConstraintConfigPlaceholder("Shape of melody")
			//   setAddNoteConstraintCallback(() => (config: string) => {
			//     TODODO const shape = config.split(" ").map(str => parseInt(str))
			//     addNoteConstraint(new MelodyShapeHardConstraint(constantGrabber(shape)))
			//   })
			//   break
		default:
			throw new Error(`Unknown note constraint ${value}`)
		}
	}

	return <>
		<Select options={getNoteConstraintOptions()} placeholder="Add a note constraint..." 
			onChange={(option) => {setNoteConstraintSelected(option); updateNoteConstraintAdder(option?.value)}} 
			value={noteConstraintSelected}
			styles={selectStyles}
		/>
		<input type="text" placeholder={noteConstraintConfigPlaceholder} hidden={noteConstraintConfigHidden}
			onChange={(e) => setNoteConstraintConfig(e.target.value)}/>
		<NoteSelector hidden={noteSelectorHidden} value={noteSelectorValue} setValue={setNoteSelectorValue}/>
		<button hidden={noteConstraintButtonHidden} onClick={addNoteConstraintButtonCallback}>Add</button>
	</>
}
