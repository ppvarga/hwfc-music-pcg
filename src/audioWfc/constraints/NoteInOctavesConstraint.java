package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;

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
