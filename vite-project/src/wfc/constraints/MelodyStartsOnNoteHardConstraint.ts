import { OctavedNote, Note } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"
import { noteConstraintTypeToName } from "./constraintUtils"

export class MelodyStartsOnNoteHardConstraint implements HardConstraint<OctavedNote> {
	private grabber: Grabber<Note>
	name = noteConstraintTypeToName.get("MelodyStartsOnNoteHardConstraint") as string
	configText = () => `Note: ${this.grabber.configText()}`
	constructor(grabber: Grabber<Note>) {
		this.grabber = grabber
	}

	check(tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
		if(tile.getPosition() != 0) return true
		const note = tile.getValue()
		const startNote = this.grabber.grab(higherValues)
		return note.getNote() == startNote
	}
}
