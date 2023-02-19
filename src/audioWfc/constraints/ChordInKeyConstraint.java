package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;

public class ChordInKeyConstraint implements HardConstraint<Chord>{
    private Key key;

    public ChordInKeyConstraint(Key key) {
        this.key = key;
    }

    @Override
    public boolean check(Tile<Chord> tile) {
        return key.getBasicChords().contains(tile.getValue());
    }
}
