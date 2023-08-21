import { useAppContext } from "../AppState"
import { ChordInKeyConstraint } from "../wfc/constraints/ChordInKeyHardConstraint"
import { ChordRootAbsoluteStepSizeHardConstraint } from "../wfc/constraints/ChordRootAbsoluteStepSizeHardConstraint"
import { PerfectCadenceSoftConstraint } from "../wfc/constraints/cadences/PerfectCadenceSoftConstraint"
import { PlagalCadenceSoftConstraint } from "../wfc/constraints/cadences/PlagalCadenceSoftConstraint"
import { Constraint } from "../wfc/constraints/concepts/Constraint"
import { constantGrabber } from "../wfc/grabbers/constantGrabbers"
import Select from "react-select"
import { Chordesque } from "../wfc/hierarchy/prototypes"
import { useState } from "react"
import { chordConstraintOptions, constraintTextConfig } from "../wfc/constraints/constraintUtils"
import { selectStyles } from "../styles"


function ChordConstraintDiv({constraint}: {constraint: Constraint<Chordesque>}) {
	const {removeChordConstraint} = useAppContext()

	return <div className="chord-constraint-div">
		<h5>{constraint.name}</h5>
		<p>{constraint.configText()}</p>
		<button onClick={() => removeChordConstraint(constraint)}>Remove</button>
	</div>
}

export function ChordConstraints() {
	const {chordConstraintSet} = useAppContext()
	return <>
		<h3>Chord constraints</h3>
		{chordConstraintSet.getAllConstraints().map((constraint, i) => <ChordConstraintDiv key={i} constraint={constraint}/>)}
	</>
}

export function AddChordConstraint() {
  
	const {keyGrabber, addChordConstraint, chordConstraintSet} = useAppContext()
    
	const [chordConstraintConfigHidden, setChordConstraintConfigHidden] = useState(true)
	const [chordConstraintButtonHidden, setChordConstraintButtonHidden] = useState(true)
	const [chordConstraintConfigPlaceholder, setChordConstraintConfigPlaceholder] = useState("")
	const [chordConstraintConfig, setChordConstraintConfig] = useState("")
	const [addChordConstraintCallback, setAddChordConstraintCallback] = useState(() => (_config: string) => {})
	const [chordConstraintSelected, setChordConstraintSelected] = useState(null as {label: string, value: string} | null)

	const addChordConstraintButtonCallback = () => {
		addChordConstraintCallback(chordConstraintConfig)
		setChordConstraintConfig("")
		setChordConstraintConfigHidden(true)
		setChordConstraintButtonHidden(true)
		setChordConstraintSelected(null)
	}

	const getChordConstraintOptions = () => chordConstraintOptions.filter(option => !chordConstraintSet.getAllConstraints().map(constraint => constraint.name).includes(option.label))

	function updateChordConstraintAdder(value: string | undefined) {
		if(value === undefined) {
			setChordConstraintConfigHidden(true)
			setChordConstraintButtonHidden(true) 
			setChordConstraintConfigPlaceholder("")
			setAddChordConstraintCallback(() => () => {})
			return
		}

		setChordConstraintButtonHidden(false)

		const configPlaceholder = constraintTextConfig(value)
		if(configPlaceholder === undefined) {
			setChordConstraintConfigHidden(true)
			setChordConstraintConfigPlaceholder("")
		} else {
			setChordConstraintConfigHidden(false)
			setChordConstraintConfigPlaceholder(configPlaceholder)
		}

		switch(value) {
		case "ChordInKeyConstraint":
			setAddChordConstraintCallback(() => () => addChordConstraint(new ChordInKeyConstraint(keyGrabber)))
			break
		case "ChordRootAbsoluteStepSizeHardConstraint":
			setAddChordConstraintCallback(() => (config: string) => {
				const intervals = new Set(config.split(" ").map(str => parseInt(str)))
				addChordConstraint(new ChordRootAbsoluteStepSizeHardConstraint(constantGrabber(intervals)))
			})
			break
		case "PlagalCadenceSoftConstraint":
			setAddChordConstraintCallback(() => (config: string) => {
				const boost = parseInt(config)
				addChordConstraint(new PlagalCadenceSoftConstraint(boost, keyGrabber))
			})
			break
		case "PerfectCadenceSoftConstraint":
			setAddChordConstraintCallback(() => (config: string) => {
				const boost = parseInt(config)
				addChordConstraint(new PerfectCadenceSoftConstraint(boost, keyGrabber))
			})
			break
		default:
			throw new Error(`Unknown chord constraint ${value}`)
		}
	}

	return <>
		<Select options={getChordConstraintOptions()} placeholder={"Add a chord constraint..."} 
			value={chordConstraintSelected} styles={selectStyles}
			onChange={(option) => {setChordConstraintSelected(option); updateChordConstraintAdder(option?.value)}}/>
		<input type='text' hidden={chordConstraintConfigHidden} placeholder={chordConstraintConfigPlaceholder} value={chordConstraintConfig} 
			onChange={(e) => {setChordConstraintConfig(e.target.value)}}/>
		<button hidden={chordConstraintButtonHidden} onClick={addChordConstraintButtonCallback}>Add</button>
	</>
}