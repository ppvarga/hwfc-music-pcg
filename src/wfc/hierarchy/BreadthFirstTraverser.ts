import { OctavedNote } from "../../music_theory/Note"
import { Canvasable } from "../../util/utils"
import { ConflictError } from "../Tile"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"
import { NoteLevelNode } from "./NoteLevelNode"
import { Result } from "./results"

export class BreadthFirstTraverser {
    private static lastChordNode?: ChordLevelNode = undefined
    private static lastNoteNode?: NoteLevelNode = undefined
    
    static backtrackPrevChord(
        setResultAtPosition : (position: number, newResult: Result<Chordesque>) => boolean,
        prevPosition : number
    ): boolean {
        const prevNode = this.lastChordNode
        if(prevNode === undefined) return false
        try {
            const prevResult = this.tryAnother(prevNode)
            if(!setResultAtPosition(prevPosition, prevResult)) throw new Error("Looking into the future")
            return true
        } catch (e) {
            if(e instanceof ConflictError) {
                return false
            }
            throw e
        }
    }

    static backtrackPrevNote(
        setResultAtPosition : (position: number, newResult: Result<OctavedNote>) => boolean,
        prevPosition : number
    ): boolean {
        const prevNode = this.lastNoteNode
        if(prevNode === undefined) return false
        try {
            const prevResult = this.tryAnother(prevNode)
            if(!setResultAtPosition(prevPosition, prevResult)) throw new Error("Looking into the future")
            return true
        } catch (e) {
            if(e instanceof ConflictError) {
                return false
            }
            throw e
        }
    }
    
    static solveAtPosition<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(
            node: HWFCNode<P,T,C>,
            position : number, 
            sections : T[], 
            prevNode: HWFCNode<T,C,any> | undefined, 
            setResultAtPosition : (position: number, newResult: Result<C>) => boolean
        ): SubSolution<T,C,any> {
        try {
            const childNode = node.createChildNode(position)
            node.getSubNodes().push(childNode)
            childNode.getCanvas().initialize()
            if(childNode.getCanvas().getLevel() == "chord") {
                console.log("wake up babe")
            }
            const childResult = BreadthFirstTraverser.generate(childNode)

            const childLevel = childNode.getCanvas().getLevel()
            if(childLevel == "chord"){
                this.lastChordNode = childNode as unknown as ChordLevelNode
            } else if (childLevel == "melody"){
                this.lastNoteNode = childNode as unknown as NoteLevelNode
            } else throw new Error("This is not a child")

            return {result: childResult}
            
        } catch (e) {
            if (e instanceof ConflictError){		
                const successfulBacktrack = node.getCanvas().getLevel() == "section" ?
                    BreadthFirstTraverser.backtrackPrevChord(setResultAtPosition, position - 1) :
                    BreadthFirstTraverser.backtrackPrevNote(setResultAtPosition, position - 1)
                if (successfulBacktrack) {
                    node.getSubNodes().pop()
                    return BreadthFirstTraverser.solveAtPosition(node, position, sections, prevNode, setResultAtPosition)
                } else {
                    return "Fail"
                }
            } else throw e
        }
    }
    
    public static generate<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>): Result<P> {
        return this.generateCore(node,node.getCanvas().generate())
    }
        

    public static tryAnother<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>): Result<P> {
        return this.generateCore(node, node.getCanvas().tryAnother())
    }

    private static generateCore<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>, items: T[]): Result<P> {
        if(node instanceof NoteLevelNode) return node.mergeResults(items)
        let isValid = true
        const results : Result<C>[] = []
        const setResultAtPosition = (position: number, newResult: Result<C>) => {
            if(position < 0 || position >= results.length) return false
            results[position] = newResult
            return true
        }
    
        while(true){
            let prevNode : HWFCNode<T,C,any> | undefined = undefined
    
            for (let i = 0; i < items.length; i++) {
                const subSolution: SubSolution<T,C,any> = BreadthFirstTraverser.solveAtPosition(node, i, items, prevNode, setResultAtPosition)
                if(subSolution === "Fail") {
                    if(node.getCanvas().getLevel() == "chord") console.log(node)
                    isValid = false
                    break
                }
                const result = subSolution.result
                results.push(result)
            }
            if (isValid) break
            items = node.getCanvas().tryAnother()
        }
        return node.mergeResults(results)
    }
}

interface SubSolutionSuccess<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>> {
    result : Result<T>
} 

type SubSolution<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>> = SubSolutionSuccess<P,T,C> | "Fail"