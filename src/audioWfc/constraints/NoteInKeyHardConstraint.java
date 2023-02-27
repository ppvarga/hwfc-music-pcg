package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;

public class NoteInKeyHardConstraint implements HardConstraint<OctavedNote> {
    private Key key;

    public NoteInKeyHardConstraint(Grabber<Key> key){
        this.key = key.grab();
    }

    @Override
    public boolean check(Tile<OctavedNote> item) {
        return key.contains(item.getValue().getNote());
    }
}
