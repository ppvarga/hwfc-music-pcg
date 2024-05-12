import { Canvasable } from "../../util/utils"
import { TileCanvas } from "../TileCanvas"
import { BreadthFirstTraverser } from "./BreadthFirstTraverser"
import { SharedDecision } from "./backtracking"
import { Result } from "./results"

export abstract class HWFCNode<P extends Canvasable, T extends Canvasable, C extends Canvasable> {
    protected parent?: HWFCNode<any,P,T>
    protected abstract canvas: TileCanvas<P, T, C>
    protected abstract position: number
    protected abstract subNodes: HWFCNode<T, C, any>[]
    protected abstract decisions: SharedDecision[]

    public getParent(): HWFCNode<any,P,T> | undefined {
        return this.parent
    }

    public getCanvas(): TileCanvas<P, T, C> {
        return this.canvas
    }

    public getPosition(): number {
        return this.position
    }

    public getSubNodes(): HWFCNode<T, C, any>[] {
        return this.subNodes
    }

	public generate(): Result<T> {
        return BreadthFirstTraverser.generate(this)
    }

    public abstract mergeResults(subResults: Result<T>[]): Result<P>

    public abstract createChildNode(position: number): HWFCNode<T,C,any> 
}