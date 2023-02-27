package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;

public class ChordInKeyConstraint implements HardConstraint<Chord>{
    private Key key;

    public ChordInKeyConstraint(Grabber<Key> key) {
        this.key = key.grab();
    }

    @Override
    public boolean check(Tile<Chord> tile) {
        return key.getBasicChords().contains(tile.getValue());
    }
}
