import { NoteOutput } from "../../components/MidiPlayer"
import { Canvasable, Equatable } from "../../util/utils"
import { TileCanvas } from "../TileCanvas"
import { SharedDecision } from "./backtracking"
import { Result } from "./results"

export abstract class HWFCNode<P extends Canvasable, T extends Canvasable, C extends Canvasable> {
    protected parent?: HWFCNode<any,P,T>
    protected abstract canvas: TileCanvas<P, T>
    protected abstract position: number
    protected abstract subNodes: HWFCNode<T, C, any>[]
    protected abstract decisions: SharedDecision[]

    public getParent(): HWFCNode<any,P,T> | undefined {
        return this.parent
    }

    public getCanvas(): TileCanvas<P, T> {
        return this.canvas
    }

    public getPosition(): number {
        return this.position
    }

    public getSubNodes(): HWFCNode<T, C, any>[] {
        return this.subNodes
    }

    public abstract tryAnother(): Result<T>

	public abstract generate(): Result<T>

    public abstract mergeResults(subResults: Result<C>[]): Result<T>

    public abstract createChildNode(position: number): HWFCNode<T,C,any> 
}