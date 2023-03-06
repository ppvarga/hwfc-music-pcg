package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
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
