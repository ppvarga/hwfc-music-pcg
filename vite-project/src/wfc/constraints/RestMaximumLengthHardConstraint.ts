import { RhythmPattern } from "../../music_theory/Rhythm"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"

export class RestMaximumLengthHardConstraint implements HardConstraint<RhythmPattern>{
	name = "Rest Maximum Length"
	configText = () => `Rest Maximum Length: ${this.maximumLength}`

	private maximumLength: number

	constructor(maximumLength: number) {
		this.maximumLength = maximumLength
	}

	check(tile: Tile<RhythmPattern>, _higherValues: HigherValues): boolean {
		const rhythmPattern = tile.getValue()
		return !rhythmPattern.some((note) => note.type == "rest" && note.duration > this.maximumLength)
	}

}
    
