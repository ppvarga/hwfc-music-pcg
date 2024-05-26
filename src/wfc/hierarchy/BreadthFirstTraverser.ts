import { ConflictError } from "../Tile"
import { ChordLevelNode } from "./ChordLevelNode"
import { NoteLevelNode } from "./NoteLevelNode"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class BreadthFirstTraverser {
    
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().generate()

        for(let i = 0; i < sectionLevelNode.getCanvas().getSize(); i++){
            resultManager.chordLevelNodes.push(undefined)
        }

        while(true){
            sectionLevelNode.clearSubNodes()
            sectionLevelNode.createSubNodes()

            try{
                let lastChordLevelNode = undefined

                for (let i = 0; i < sectionLevelNode.getCanvas().getSize(); i++){
                    const chordLevelNode = sectionLevelNode.getSubNodes()[i]
                    resultManager.chordLevelNodes[i] = chordLevelNode as unknown as ChordLevelNode
                    const skeleton = []
                    for(let i = 0; i < chordLevelNode.getCanvas().getSize(); i++){
                        skeleton.push(undefined)
                    }
                    resultManager.noteLevelNodes[chordLevelNode.getPosition()] = skeleton

                    
                    chordLevelNode.getCanvas().generate()
                }

                while(true) {
                    const noteLevelNodes = []

                    for (let i = 0; i < sectionLevelNode.getCanvas().getSize(); i++){
                        const chordLevelNode = sectionLevelNode.getSubNodes()[i]
                        
                        chordLevelNode.clearSubNodes()
                        chordLevelNode.createSubNodes()
                        
                        noteLevelNodes.push(...chordLevelNode.getSubNodes())
                        
                        lastChordLevelNode = chordLevelNode
                    }

                    try{
                        for (let i = 0; i < noteLevelNodes.length; i++){
                            noteLevelNodes[i].getCanvas().initialize()
                        }

                        for (let i = 0; i < noteLevelNodes.length; i++){
                            const noteLevelNode = noteLevelNodes[i]
                            resultManager.noteLevelNodes[noteLevelNode.getParent()!.getPosition()][noteLevelNode.getPosition()] = noteLevelNode as unknown as NoteLevelNode
                            noteLevelNode.getCanvas().generate()
                        }
                        return

                    } catch (e) {
                        if(!(e instanceof ConflictError)) throw e
                        lastChordLevelNode!.getCanvas().tryAnother() 
                    }
                }
                
            } catch (e) {
                if(!(e instanceof ConflictError)) throw e
                sectionLevelNode.getCanvas().tryAnother() 
            }
        }
    }
}
