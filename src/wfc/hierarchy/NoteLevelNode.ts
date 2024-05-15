import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"
import { SharedDecision } from "./backtracking"
import { ChordResult, MelodyResult, Result } from "./results"

export class NoteLevelNode extends HWFCNode<Chordesque, OctavedNote, any>{
	protected canvas: TileCanvas<Chordesque, OctavedNote, never>
	protected subNodes: HWFCNode<OctavedNote, any, never>[] = []

	constructor(
		canvasProps: TileCanvasProps<OctavedNote>,
		private higherValues: HigherValues,
		random: Random,
		protected parent: ChordLevelNode,
		protected position: number,
		protected decisions: SharedDecision[]
	) {
		super()
		this.canvas = new TileCanvas<Chordesque, OctavedNote, any>(
			higherValues.melodyLength,
			canvasProps,
			higherValues,
			random,
			this,
			decisions,
			"melody"
		)
	}

	public mergeResults(subResults: Result<OctavedNote>[]): Result<Chordesque> {
		const chordResult: ChordResult = {
			chord: this.higherValues.chord!,
			notes: (subResults as MelodyResult[]),
			rhythmPattern: this.higherValues.rhythmPattern!,
			bpm: this.higherValues.bpm
		} 
		return chordResult
	}

	public createChildNode(position: number): HWFCNode<OctavedNote, any, any> {
		throw new Error("This should not be called")
	}

}
