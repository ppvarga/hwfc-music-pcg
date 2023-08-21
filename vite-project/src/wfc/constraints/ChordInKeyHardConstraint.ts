import { MusicalKey } from "../../music_theory/MusicalKey"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Chordesque } from "../hierarchy/prototypes"
import { HardConstraint } from "./concepts/Constraint"
import { chordConstraintTypeToName } from "./constraintUtils"

export class ChordInKeyConstraint implements HardConstraint<Chordesque> {
	private grabber: Grabber<MusicalKey>
	name = chordConstraintTypeToName.get("ChordInKeyConstraint") as string
	configText = () => `Key: ${this.grabber.configText()}`
	constructor(grabber: Grabber<MusicalKey>) {
		this.grabber = grabber
	}

	check(tile: Tile<Chordesque>, higherValues: HigherValues): boolean {
		const chord = tile.getValue().getChord()
		const key = this.grabber.grab(higherValues)
		return key.containsChord(chord)
	}
}