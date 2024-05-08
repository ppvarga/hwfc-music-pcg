import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"
import { SharedDecision } from "./backtracking"

export class NoteLevelNode extends HWFCNode<Chordesque, OctavedNote>{
	protected canvas: TileCanvas<Chordesque, OctavedNote>
	protected subNodes: HWFCNode<OctavedNote, any>[] = []

	constructor(
		canvasProps: TileCanvasProps<OctavedNote>,
		higherValues: HigherValues,
		random: Random,
		protected parent: ChordLevelNode,
		protected position: number,
		protected decisions: SharedDecision[]
	) {
		super()
		this.canvas = new TileCanvas<Chordesque, OctavedNote>(
			higherValues.melodyLength,
			canvasProps,
			higherValues,
			random,
			this,
			decisions,
			"melody"
		)
	}

	public generate(): OctavedNote[] {
		return this.canvas.generate()
	}
}
