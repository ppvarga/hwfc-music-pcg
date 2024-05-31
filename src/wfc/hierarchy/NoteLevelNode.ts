import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { lastMelody, lockedMelody } from "../../util/utils"

export class NoteLevelNode {
	private canvas: TileCanvas<OctavedNote>
	private sectionNumber: number
	private chordNumber: number

	constructor(
		canvasProps: TileCanvasProps<OctavedNote>,
		higherValues: HigherValues,
		random: Random,
		sectionNumber: number,
		chordNumber: number,
	) {
		const optionsCopy = canvasProps.optionsPerCell.cells.copy()
		if (lockedMelody[sectionNumber] !== undefined && lockedMelody[sectionNumber][chordNumber] !== undefined && lockedMelody[sectionNumber][chordNumber].length > 0) {
			for (let i = 0; i < lockedMelody[sectionNumber][chordNumber].length; i++) {
				if (lockedMelody[sectionNumber][chordNumber][i] !== undefined) {
					canvasProps.optionsPerCell.setValue(i, lockedMelody[sectionNumber][chordNumber][i])
				}
			}
		}
		this.canvas = new TileCanvas<OctavedNote>(
			higherValues.melodyLength,
			canvasProps,
			higherValues,
			random,
		)
		canvasProps.optionsPerCell.cells = optionsCopy
		this.sectionNumber = sectionNumber
		this.chordNumber = chordNumber
	}

	public generate(): OctavedNote[] {
		const notes = this.canvas.generate()

		if (lastMelody[this.sectionNumber] === undefined) {
			lastMelody[this.sectionNumber] = []
		}
		lastMelody[this.sectionNumber][this.chordNumber] = []
		lastMelody[this.sectionNumber][this.chordNumber].push(...notes)

		return notes
	}
}
