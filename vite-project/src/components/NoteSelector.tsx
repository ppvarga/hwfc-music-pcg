import Select from "react-select"
import { Note } from "../music_theory/Note"
import { useState } from "react"
import { Grabber } from "../wfc/Grabber"
import { constantGrabber } from "../wfc/grabbers/constantGrabbers"
import { fifthOfChordGrabber, rootOfChordGrabber, thirdOfChordGrabber } from "../wfc/grabbers/noteGrabbers"
import { selectStyles } from "../styles"
import { ConstantNoteSelector, noteOptions } from "./GlobalSettings"

interface NoteSelectorProps {
  hidden: boolean
  value: NoteSelectorResult
  setValue:  (_: NoteSelectorResult) => void
}

export type NoteSelectorResult = Grabber<Note> | null

const noteSelectorOptions = [
	{label: "Root of chord", value: "RootOfChord"},
	{label: "Third of chord", value: "ThirdOfChord"},
	{label: "Fifth of chord", value: "FifthOfChord"},
	{label: "Custom", value: "Custom"},
]

export function NoteSelector({hidden, setValue} : NoteSelectorProps) {
	const [selected, setSelected] = useState(null as {label: string, value: string} | null)
	const [customNoteSelected, setCustomNoteSelected] = useState(noteOptions[0])

	const buildConstantGrabber = (option: {label: string, value: Note}) => {
		setValue(constantGrabber(option.value))
	}

	return <div hidden={hidden}>
		<Select options={noteSelectorOptions} placeholder={"Select a note..."} styles={selectStyles}
			value={selected}
			onChange={(option) => {
				setSelected(option)
				switch (option?.value) {
				case "RootOfChord":
					setValue(rootOfChordGrabber())
					break
				case "ThirdOfChord":
					setValue(thirdOfChordGrabber())
					break
				case "FifthOfChord":
					setValue(fifthOfChordGrabber())
					break
				case "Custom":
					setValue(constantGrabber(customNoteSelected.value))
					break
				default:
					throw new Error("Invalid note selector option")
				}}}/>
		{selected?.value === "Custom" && <ConstantNoteSelector value={customNoteSelected} setValue={setCustomNoteSelected} onChange={buildConstantGrabber} />}
	</div>
}