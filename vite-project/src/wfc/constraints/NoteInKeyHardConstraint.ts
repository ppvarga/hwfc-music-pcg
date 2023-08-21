import { MusicalKey } from "../../music_theory/MusicalKey"
import { OctavedNote } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { noteConstraintTypeToName } from "./constraintUtils"

export class NoteInKeyHardConstraint {
	private grabber: Grabber<MusicalKey>
	name = noteConstraintTypeToName.get("NoteInKeyHardConstraint") as string
	configText = () => `Key: ${this.grabber.configText()}`
	constructor(grabber: Grabber<MusicalKey>) {
		this.grabber = grabber
	}

	check(tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
		const note = tile.getValue()
		const key = this.grabber.grab(higherValues)
		return key.containsNote(note.getNote())
	}
}