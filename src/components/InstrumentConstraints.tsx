import { useState } from "react";
import { selectStyles } from "../styles";
import Select from "react-select";
import { InterMelodyConstraintIR, InterMelodyConstraintType, initializeInterMelodyConstraint, interMelodyConstraintOptions, interMelodyConstraintTypeToName } from "../wfc/constraints/constraintUtils";
import { H4tooltip } from "./tooltips";
import { useAppContext } from "../AppState";

interface InterMelodyConstraintProps {
	constraintIR: InterMelodyConstraintIR,
	onConstraintChange: (updatedIR: InterMelodyConstraintIR) => void
	setValid: (valid: boolean) => void
}

function InterMelodyConstraintConfig({ constraintIR, onConstraintChange, setValid }: InterMelodyConstraintProps) {
	setValid = setValid
	onConstraintChange = onConstraintChange
	switch (constraintIR.type) {
		case "NoHalfStepInterMelodyConstraint":
			return <></>
	}
}

interface InterMelodyConstraintDivProps {
	constraintIR: InterMelodyConstraintIR
	onConstraintChange: (updatedIR: InterMelodyConstraintIR) => void
	onRemove: () => void
}

function InterMelodyConstraintDiv({ constraintIR, onConstraintChange, onRemove }: InterMelodyConstraintDivProps) {
	const [valid, setValid] = useState<boolean>(constraintIR.validByDefault)

	const interMelodyConstraintReadable = interMelodyConstraintTypeToName.get(constraintIR.type)!

	return <div className="constraint-div">
		<div style={{ display: "flex", justifyContent: "end", gap: "0.5em", flexDirection: "row", alignItems: "center", fontSize: 8 }}>
			<button style={{ width: "fit-content", height: "fit-content" }} onClick={onRemove}>X</button>
		</div>
		{
			interMelodyConstraintReadable.hint ?
			<H4tooltip title={interMelodyConstraintReadable.name} hint={interMelodyConstraintReadable.hint} style={{ color: valid ? "white" : "red", marginTop: 0 }} /> :
			<h4 style={{ color: valid ? "white" : "red", marginTop: 0 }}>{interMelodyConstraintReadable.name}</h4>
		}
		<InterMelodyConstraintConfig constraintIR={constraintIR} onConstraintChange={onConstraintChange} setValid={setValid} />
	</div>
}

type InterMelodyConstraintTypeOption = { value: InterMelodyConstraintType, label: string }

interface AddInterMelodyConstraintProps {
	onAddConstraint: (constraintIR: InterMelodyConstraintIR) => void
}

function AddInterMelodyConstraint({ onAddConstraint }: AddInterMelodyConstraintProps) {
	const { interMelodyConstraintSet } = useAppContext()
	const [selectedType, setSelectedType] = useState<InterMelodyConstraintTypeOption | null>(null)

	const getInterMelodyConstraintOptions = () => interMelodyConstraintOptions.filter(option => !interMelodyConstraintSet.map(constraint => constraint.type).includes(option.value)).map(option => ({ value: option.value, label: option.label.name}))

	const handleAddButtonClick = () => {
		if (!selectedType) return

		onAddConstraint(initializeInterMelodyConstraint(selectedType.value))
		console.log(interMelodyConstraintSet)
		setSelectedType(null)
	}

	return (
		<div className="add-constraint">
			<Select
				options={getInterMelodyConstraintOptions()}
				value={selectedType}
				placeholder="Intermelody constraints..."
				onChange={(option) => setSelectedType(option || null)}
				styles={selectStyles}
			/>
			<button onClick={() => { handleAddButtonClick(); setSelectedType(null) }}>Add</button>
		</div>
	)
}

export function InterMelodyConstraints() {
	const { interMelodyConstraintSet, addInterMelodyConstraint, removeInterMelodyConstraint, handleInterMelodyConstraintChange } = useAppContext()

	return (
		<div style={{ flex: 1 }}>
			<h3>Intermelody constraints</h3>
			<AddInterMelodyConstraint onAddConstraint={addInterMelodyConstraint} />
			{interMelodyConstraintSet.map((constraintIR, index) => (
				<InterMelodyConstraintDiv
					key={index}
					constraintIR={constraintIR}
					onConstraintChange={(updatedIR) => handleInterMelodyConstraintChange(index, updatedIR)}
					onRemove={() => removeInterMelodyConstraint(index)}
				/>
			))}
		</div>
	)
}