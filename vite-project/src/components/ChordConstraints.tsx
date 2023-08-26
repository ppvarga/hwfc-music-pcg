import { useState } from "react"
import { ChordConstraintIR, ChordConstraintType, chordConstraintOptions, chordConstraintTypeToName, initializeChordConstraint } from "../wfc/constraints/constraintUtils"
import { useAppContext } from "../AppState"
import Select from "react-select"
import { selectStyles } from "../styles"
import { SimpleConstraintConfigDiv } from "./SimpleConstraintConfigDiv"

interface ChordConstraintConfigProps {
	constraintIR: ChordConstraintIR
	onConstraintChange: (updatedIR: ChordConstraintIR) => void
	setValid: (valid: boolean) => void
}

export function ChordConstraintConfig({ constraintIR, onConstraintChange, setValid }: ChordConstraintConfigProps) {
	switch (constraintIR.type) {
		case "ChordInKeyHardConstraint": return <></>
		case "ChordRootAbsoluteStepSizeHardConstraint": return <SimpleConstraintConfigDiv>
			<input
				type="text"
				placeholder="Allowed intervals"
				defaultValue={constraintIR.stepSizes.join(" ")}
				onChange={(e) => {
					const stepSizes = e.target.value.split(" ").map(str => parseInt(str)).filter(num => !isNaN(num))
					if (stepSizes.length > 0) {
						setValid(true)
						onConstraintChange({ ...constraintIR, stepSizes })
					}
					else setValid(false)
				}}
			/>
		</SimpleConstraintConfigDiv>
		case "PerfectCadenceSoftConstraint": return <SimpleConstraintConfigDiv>
			<input
				type="number"
				placeholder="Boost value"
				min={1}
				defaultValue={constraintIR.bonus}
				onChange={(e) => {
					const bonus = parseInt(e.target.value)
					if (bonus > 0) {
						setValid(true)
						onConstraintChange({ ...constraintIR, bonus })
					}
					else setValid(false)
				}}
			/>
		</SimpleConstraintConfigDiv>
		case "PlagalCadenceSoftConstraint": return <SimpleConstraintConfigDiv>
			<input
				type="number"
				placeholder="Boost value"
				min={1}
				defaultValue={constraintIR.bonus}
				onChange={(e) => {
					const bonus = parseInt(e.target.value)
					if (bonus > 0) {
						setValid(true)
						onConstraintChange({ ...constraintIR, bonus })
					}
					else setValid(false)
				}}
			/>
		</SimpleConstraintConfigDiv>
	}
}

interface ChordConstraintDivProps {
	constraintIR: ChordConstraintIR
	onConstraintChange: (updatedIR: ChordConstraintIR) => void
	onRemove: () => void
}

export function ChordConstraintDiv({ constraintIR, onConstraintChange, onRemove }: ChordConstraintDivProps) {
	const [valid, setValid] = useState(constraintIR.validByDefault as boolean)

	return <div className="constraint-div">
		<h4 style={{color: valid ? "white" : "red"}}>{chordConstraintTypeToName.get(constraintIR.type)}</h4>
		<ChordConstraintConfig constraintIR={constraintIR} onConstraintChange={onConstraintChange} setValid={setValid}/>
		<button onClick={onRemove}>Remove</button>
	</div>
}

type ChordConstraintTypeOption = {value: ChordConstraintType, label: string}

interface AddChordConstraintProps {
	onAddConstraint: (constraintIR: ChordConstraintIR) => void
}

function AddChordConstraint({ onAddConstraint }: AddChordConstraintProps) {
	const { chordConstraintSet } = useAppContext()
	const [selectedType, setSelectedType] = useState<ChordConstraintTypeOption | null>(null)

	const getChordConstraintOptions = () => chordConstraintOptions.filter(option => !chordConstraintSet.map(constraint => constraint.type).includes(option.value))

	const handleAddButtonClick = () => {
		if (!selectedType) return

		onAddConstraint(initializeChordConstraint(selectedType.value))
		setSelectedType(null)
	}

	return (
		<div className="add-constraint">
			<div style={{flex:1}}>
				<Select
					options={getChordConstraintOptions()}
					value={selectedType}
					placeholder="Chord constraints..."
					onChange={(option) => setSelectedType(option || null)}
					styles={selectStyles}
				/>
			</div>
			<button onClick={() => {handleAddButtonClick(); setSelectedType(null)}}>Add</button>
		</div>
	)
}


export function ChordConstraints() {
	const {chordConstraintSet, addChordConstraint, removeChordConstraint, handleChordConstraintChange} = useAppContext()

	return (
		<>
			<h3>Chord Constraints</h3>
			{chordConstraintSet.map((constraintIR, index) => {
				return <ChordConstraintDiv
					key={index}
					constraintIR={constraintIR}
					onConstraintChange={(updatedIR) => handleChordConstraintChange(index, updatedIR)}
					onRemove={() => removeChordConstraint(index)}
				/>
			})}
			<AddChordConstraint onAddConstraint={addChordConstraint}/>
		</>
	)
}
