package audioWfc.constraints;

import audioWfc.NeighborPair;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class MelodyStepSizeHardConstraint extends HardConstraint<NeighborPair<Note>>{
    private Set<Integer> allowedStepSizes;

    @Override
    public boolean check(NeighborPair<Note> pair) {
        Note note1 = pair.getFirst();
        Note note2 = pair.getSecond();
        int distance = NoteUtils.absoluteDistance(note1, note2);
        if(allowedStepSizes.contains(distance)) return true;
        return false;
    }

    public MelodyStepSizeHardConstraint(Set<Integer> allowedStepSizes){
        this.allowedStepSizes = allowedStepSizes;
    }
}
