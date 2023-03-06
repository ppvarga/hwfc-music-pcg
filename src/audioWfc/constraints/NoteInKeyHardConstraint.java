package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;

public class NoteInKeyHardConstraint implements HardConstraint<OctavedNote> {
    private Grabber<Key> grabber;

    public NoteInKeyHardConstraint(Grabber<Key> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item, HigherValues higherValues) {
        return grabber.grab(higherValues).contains(item.getValue().getNote());
    }
}
