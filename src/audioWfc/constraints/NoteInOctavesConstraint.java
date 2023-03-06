package audioWfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;

import java.util.Set;

public class NoteInOctavesConstraint implements HardConstraint<OctavedNote> {
    private Grabber<Set<Integer>> grabber;

    public NoteInOctavesConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item, HigherValues higherValues) {
        return grabber.grab(higherValues).contains(item.getValue().getOctave());
    }
}
