package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;

public class NoteInKeyHardConstraint implements HardConstraint<OctavedNote> {
    private Key key;
    private Grabber<Key> grabber;

    public NoteInKeyHardConstraint(Grabber<Key> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item) {
        return key.contains(item.getValue().getNote());
    }

    @Override
    public void init() {
        this.key = grabber.grab();
    }
}
