import { Canvasable } from "../../util/utils"
import { ConflictError } from "../Tile"
import { HWFCNode } from "./HWFCNode"
import { Result } from "./results"

export class BreadthFirstTraverser {
    public static generate<P extends Canvasable, T extends Canvasable, C extends Canvasable>(node: HWFCNode<P,T,C>): Result<C> {
        let sections = node.getCanvas().generate()
        let isValid = true
        const results : Result<C>[] = []
        const setResultAtPosition = (position: number, newResult: Result<C>) => {
            if(position < 0 || position >= results.length) return false
            results[position] = newResult
            return true
        }
    
        while(true){
            let prevNode : HWFCNode<T,C,any> | undefined = undefined
    
            for (let i = 0; i < sections.length; i++) {
                const subSolution: SubSolution<T,C,any> = BreadthFirstTraverser.solveAtPosition(node, i, sections, prevNode, setResultAtPosition)
                if(subSolution === "Fail") {
                    isValid = false
                    break
                }
                const result = subSolution.result
                results.push(result)
                prevNode = subSolution.newprevNode
            }
            if (isValid) break
            sections = node.getCanvas().tryAnother()
        }
        return node.mergeResults(results)
    }
    
    static backtrackPrev<T extends Canvasable, C extends Canvasable>(
        prevNode: HWFCNode<T,C,any> | undefined,
        setResultAtPosition : (position: number, newResult: Result<C>) => boolean,
        prevPosition : number
    ): boolean {
        if(prevNode === undefined) return false
        try {
            const prevResult = prevNode.tryAnother()
            if(!setResultAtPosition(prevPosition, prevResult)) throw new Error("Looking into the future")
            return true
        } catch (e) {
            if(e instanceof ConflictError) {
                return false
            }
            throw e
        }
    
    }
    
    static solveAtPosition<P extends Canvasable, T extends Canvasable, C extends Canvasable>(
            node: HWFCNode<P,T,C>,
            position : number, 
            sections : T[], 
            prevNode: HWFCNode<T,C,any> | undefined, 
            setResultAtPosition : (position: number, newResult: Result<C>) => boolean
        ): SubSolution<T,C,any> {
        const childNode = node.createChildNode(position)
        node.getSubNodes().push(childNode)
        try {
            const childResult = childNode.generate()
            return {result: childResult, newprevNode:childNode}
        } catch (e) {
            if (e instanceof ConflictError){		
                if (BreadthFirstTraverser.backtrackPrev(prevNode, setResultAtPosition, position - 1)) {
                    node.getSubNodes().pop()
                    return BreadthFirstTraverser.solveAtPosition(node, position, sections, prevNode, setResultAtPosition)
                } else {
                    return "Fail"
                }
            } else throw e
        }
    }

}

interface SubSolutionSuccess<P extends Canvasable, T extends Canvasable, C extends Canvasable> {
result : Result<T>
newprevNode : HWFCNode<P,T,C>
} 

type SubSolution<P extends Canvasable, T extends Canvasable, C extends Canvasable> = SubSolutionSuccess<P,T,C> | "Fail"