package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.musicTheory.Key;

import static audioWfc.wfc.constraints.ConstraintUtils.MELODY_IN_KEY;

public class NoteInKeyHardConstraint implements HardConstraint<OctavedNote> {
    private Grabber<Key> grabber;

    public NoteInKeyHardConstraint(Grabber<Key> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item, HigherValues higherValues) {
        return grabber.grab(higherValues).contains(item.getValue().getNote());
    }

    @Override
    public String name() {
        return MELODY_IN_KEY;
    }

    @Override
    public String configText() {
        return grabber.configText();
    }
}
