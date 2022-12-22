package audioWfc.constraints;

import audioWfc.NeighborPair;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class ChordStepSizeHardConstraint extends HardConstraint<NeighborPair<Chord>> {
    private Set<Integer> allowedStepSizes;

    @Override
    public boolean check(NeighborPair<Chord> pair) {
        Chord chord1 = pair.getFirst();
        Chord chord2 = pair.getSecond();
        int distance = NoteUtils.absoluteDistance(chord1.getRoot(), chord2.getRoot());
        if(allowedStepSizes.contains(distance)) return true;
        return false;
    }

    public ChordStepSizeHardConstraint(Set<Integer> allowedStepSizes){
        this.allowedStepSizes = allowedStepSizes;
    }
}
