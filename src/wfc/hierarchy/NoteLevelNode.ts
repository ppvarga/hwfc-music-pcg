import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { ConstraintHierarchy } from "../constraints/ConstraintInferrer/ConstraintHierarchy"
import { Constraint } from "../constraints/concepts/Constraint"

export class NoteLevelNode {
	private canvas: TileCanvas<OctavedNote>

	constructor(
		
		higherValues: HigherValues,
		random: Random,
		canvasProps?: TileCanvasProps<OctavedNote>,
		canvas?: TileCanvas<OctavedNote>
	) {
		if (!canvasProps && !canvas) {
			throw new Error("At least one of canvasProps or canvas must be provided.");
		}

		if (canvas) {
			this.canvas = canvas;
		} else {
			this.canvas = new TileCanvas<OctavedNote>(
				higherValues.melodyLength,
				canvasProps!,
				higherValues,
				random,
			);
		}
		
	}
	public inferConstraints(constraintHierarchy?: ConstraintHierarchy<OctavedNote>): Map<OctavedNote, Constraint<OctavedNote>[]>{
		if (constraintHierarchy != null){
			return constraintHierarchy.checkConstraintsGeneric(this.canvas.getConstraints(), this.canvas.getTiles())
		} else {
			const newConstraintHierarchy: ConstraintHierarchy<OctavedNote> = new ConstraintHierarchy<OctavedNote>(this.canvas.getHigherValues())
			return newConstraintHierarchy.checkConstraintsGeneric(this.canvas.getConstraints(), this.canvas.getTiles())
		}
	}
	
	public generate(): OctavedNote[] {
		return this.canvas.generate()
	}
}
