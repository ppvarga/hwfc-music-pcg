import { Equatable } from "../../util/utils"
import { TileCanvas } from "../TileCanvas"

export abstract class HWFCNode<P extends Equatable, T extends Equatable> {
    protected parent?: HWFCNode<any,P>
    protected abstract canvas: TileCanvas<P, T>
    protected abstract position: number
    protected abstract subNodes: HWFCNode<T, any>[]

    public getParent(): HWFCNode<any,P> | undefined {
        return this.parent
    }

    public getCanvas(): TileCanvas<P, T> {
        return this.canvas
    }

    public getPosition(): number {
        return this.position
    }

    public getSubNodes(): HWFCNode<T, any>[] {
        return this.subNodes
    }
}