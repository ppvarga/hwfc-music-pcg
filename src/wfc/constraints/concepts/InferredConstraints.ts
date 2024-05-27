import { NoteOutput } from "../../../components/MidiPlayer"
import { Tile } from "../../Tile"
import { Constraint } from "./Constraint"

export interface InferredConstraint<T> {
	name: string
	Infer: (tile: NoteOutput[]) => Constraint<T>
}

