import { ConflictError } from "../Tile"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class BreadthFirstTraverser {
    
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().generate()

        while(true){
            try{
                let lastChordLevelNode = undefined

                for (let i = 0; i < sectionLevelNode.getCanvas().getSize(); i++){
                    const chordLevelNode = sectionLevelNode.getSubNodes()[i]
                    const skeleton = []
                    for(let i = 0; i < chordLevelNode.getCanvas().getSize(); i++){
                        skeleton.push(undefined)
                    }

                    chordLevelNode.getCanvas().generate()
                }

                while(true) {
                    const noteLevelNodes = []

                    for (let i = 0; i < sectionLevelNode.getCanvas().getSize(); i++){
                        const chordLevelNode = sectionLevelNode.getSubNodes()[i]
                        
                        noteLevelNodes.push(...chordLevelNode.getSubNodes())
                        
                        lastChordLevelNode = chordLevelNode
                    }

                    try{
                        for (let i = 0; i < noteLevelNodes.length; i++){
                            noteLevelNodes[i].getCanvas().initialize()
                        }

                        for (let i = 0; i < noteLevelNodes.length; i++){
                            const noteLevelNode = noteLevelNodes[i]
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
