import { Chord } from "../../../music_theory/Chord";
import { ConstraintSet } from "../../ConstraintSet";
import { HigherValues } from "../../HigherValues";
import { Tile } from "../../Tile";
import { TileCanvas } from "../../TileCanvas";
import { ChordLevelNode } from "../../hierarchy/ChordLevelNode";
import { Chordesque } from "../../hierarchy/Chordesque";
import { Section } from "../../hierarchy/Section";
import { SectionLevelNode } from "../../hierarchy/SectionLevelNode";
import { Constraint, HardConstraint } from "../concepts/Constraint";


export class ConstraintHierarchy<T>{
   
    private higherValues: HigherValues
    
    constructor(higherValues : HigherValues){
       
        this.higherValues = higherValues
    }


    checkConstraintsGeneric(currentConstraintsToCheck : ConstraintSet<T>, tileCanvas: Tile<T>[]): [T, Constraint<T>[]][]{
        const sectionTiles = tileCanvas
        let result: [T, Constraint<T>[]][] = [];
        sectionTiles.forEach( sectionTile => {
            let constraints : Constraint<T>[] = []
            currentConstraintsToCheck.getAllHardConstraints().forEach( constraint => {
                
                if (constraint.check( sectionTile, this.higherValues)){
                    constraints.push(constraint)
                   
                }
                
            })
            result.push([sectionTile.getValue(), constraints])
        }
        

        )
        console.log(result)
        return result

    }

}