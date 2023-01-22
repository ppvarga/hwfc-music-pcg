package audioWfc.constraints;

import audioWfc.NeighborPair;
import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class MelodyStepSizeHardConstraint implements HardConstraint<Note>{
    private Set<Integer> allowedStepSizes;

    @Override
    public boolean check(Tile<Note> tile) {
        return checkWithPrev(tile) && checkWithNext(tile);
    }

    private boolean checkWithPrev(Tile<Note> tile) {
        Tile<Note> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        Note note1 = prev.getValue();
        Note note2 = tile.getValue();
        return checkConcrete(note1, note2);
    }

    private boolean checkWithNext(Tile<Note> tile) {
        Tile<Note> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        Note note1 = tile.getValue();
        Note note2 = next.getValue();
        return checkConcrete(note1, note2);
    }


    private boolean checkConcrete(Note note1, Note note2) {
        int distance = NoteUtils.absoluteDistance(note1, note2);
        return allowedStepSizes.contains(distance);
    }

    public MelodyStepSizeHardConstraint(Set<Integer> allowedStepSizes){
        this.allowedStepSizes = allowedStepSizes;
    }
}
