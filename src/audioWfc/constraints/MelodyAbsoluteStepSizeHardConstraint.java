package audioWfc.constraints;

import audioWfc.NeighborPair;
import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class MelodyAbsoluteStepSizeHardConstraint implements HardConstraint<OctavedNote>{
    private Set<Integer> allowedStepSizes;

    @Override
    public boolean check(Tile<OctavedNote> tile) {
        return checkWithPrev(tile) && checkWithNext(tile);
    }

    private boolean checkWithPrev(Tile<OctavedNote> tile) {
        Tile<OctavedNote> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        OctavedNote note1 = prev.getValue();
        OctavedNote note2 = tile.getValue();
        return checkConcrete(note1, note2);
    }

    private boolean checkWithNext(Tile<OctavedNote> tile) {
        Tile<OctavedNote> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        OctavedNote note1 = tile.getValue();
        OctavedNote note2 = next.getValue();
        return checkConcrete(note1, note2);
    }


    private boolean checkConcrete(OctavedNote note1, OctavedNote note2) {
        int distance = Math.abs(note2.MIDIValue() - note1.MIDIValue());
        return allowedStepSizes.contains(distance);
    }

    public MelodyAbsoluteStepSizeHardConstraint(Set<Integer> allowedStepSizes){
        this.allowedStepSizes = allowedStepSizes;
    }
}
