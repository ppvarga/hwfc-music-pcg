import { Canvasable } from "../../util/utils"
import { ConflictError } from "../Tile"
import { ChordLevelNode } from "./ChordLevelNode"
import { HWFCNode } from "./HWFCNode"
import { NoteLevelNode } from "./NoteLevelNode"
import { ResultManager } from "./results"

export class BreadthFirstTraverser {
    
    static solveAtPosition<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(
            node: HWFCNode<P,T,C>,
            position : number, 
            resultManager: ResultManager
        ): boolean {
        try {
            const childNode = node.getSubNodes()[position]
            childNode.getCanvas().initialize()
            BreadthFirstTraverser.generate(childNode, resultManager)

            return true
            
        } catch (e) {
            if (e instanceof ConflictError){
                node.resetSubNodeAt(position)
                if(node.getLevel() == "section") {
                    resultManager.chordLevelNodes[position] = node.getSubNodes()[position] as unknown as ChordLevelNode
                } else if (node.getLevel() == "chord") {
                    resultManager.noteLevelNodes[node.getPosition()][position] = node.getSubNodes()[position] as unknown as NoteLevelNode
                }
                return false
            } else throw e
        }
    }
    
    public static generate<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>, resultManager: ResultManager) {
        if(node.getPosition() == 3){
            console.log("fakka")
        }
        this.generateCore(node,node.getCanvas().generate(), resultManager)
    }
        

    public static tryAnother<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>, resultManager: ResultManager) {
        this.generateCore(node, node.getCanvas().tryAnother(), resultManager)
    }

    private static generateCore<P extends Canvasable<P>, T extends Canvasable<T>, C extends Canvasable<C>>(node: HWFCNode<P,T,C>, items: T[], resultManager: ResultManager) {
        console.log(items)
        
        if(node.getLevel() == "section") {
            for(let i = 0; i < node.getCanvas().getSize(); i++){
                resultManager.chordLevelNodes.push(undefined)
            }
        } else if(node.getLevel() == "chord") {
            resultManager.chordLevelNodes[node.getPosition()] = (node as unknown as ChordLevelNode)
            const skeleton = []
            for(let i = 0; i < node.getCanvas().getSize(); i++){
                skeleton.push(undefined)
            }
            resultManager.noteLevelNodes[node.getPosition()] = skeleton
        } else if (node.getLevel() == "melody") {
            const melodyPosition = node.getPosition()
            const chordPosition = node.getParent()!.getPosition()
            resultManager.noteLevelNodes[chordPosition][melodyPosition] = (node as unknown as NoteLevelNode)
            return
        }

        while(true){    
            let isValid = true
            node.clearSubNodes()
            node.createSubNodes()
            
            for (let i = 0; i < items.length; i++) {
                const subSolution: boolean = BreadthFirstTraverser.solveAtPosition(node, i, resultManager)
                if(!subSolution) {
                    isValid = false
                    break
                }
            }
            if (isValid) break
            items = node.getCanvas().tryAnother()
        }
    }
}
