package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;

public class ChordInKeyConstraint implements HardConstraint<Chord>{
    private Grabber<Key> grabber;

    public ChordInKeyConstraint(Grabber<Key> grabber) {
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<Chord> tile, HigherValues higherValues) {
        return grabber.grab(higherValues).getBasicChords().contains(tile.getValue());
    }
}
