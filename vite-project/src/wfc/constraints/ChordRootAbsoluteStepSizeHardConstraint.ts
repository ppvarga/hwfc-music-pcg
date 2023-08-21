import { Chord } from "../../music_theory/Chord"
import { noteDistanceAbs } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Chordesque } from "../hierarchy/prototypes"
import { HardConstraint } from "./concepts/Constraint"
import { chordConstraintTypeToName } from "./constraintUtils"

export class ChordRootAbsoluteStepSizeHardConstraint implements HardConstraint<Chordesque> {
	private grabber: Grabber<Set<number>>
	name = chordConstraintTypeToName.get("ChordRootAbsoluteStepSizeHardConstraint") as string
	configText = () => `Step Size Set: ${this.grabber.configText()}`
	constructor(grabber: Grabber<Set<number>>) {
		this.grabber = grabber
	}

	check(tile: Tile<Chordesque>, higherValues: HigherValues): boolean {
		const chord = tile.getValue().getChord()
		const prev = tile.getPrev()
		const next = tile.getNext()

		let out = true
		if(prev.isCollapsed()) out = out && this.checkPair(prev.getValue().getChord(), chord, higherValues)
		if(next.isCollapsed()) out = out && this.checkPair(chord, next.getValue().getChord(), higherValues)
		return out
	}

	private checkPair(first: Chord, second: Chord, higherValues: HigherValues): boolean {
		const stepSizeSet = this.grabber.grab(higherValues)
		const firstRoot = first.getRoot()
		const secondRoot = second.getRoot()
		const stepSize = noteDistanceAbs(firstRoot, secondRoot)
		return stepSizeSet.has(stepSize)
	}
}