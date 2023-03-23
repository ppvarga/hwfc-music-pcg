package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;

public class ChordInKeyConstraint implements HardConstraint<Chord> {
    private Grabber<Key> grabber;

    public ChordInKeyConstraint(Grabber<Key> grabber) {
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<Chord> tile, HigherValues higherValues) {
        return grabber.grab(higherValues).getBasicChords().contains(tile.getValue());
    }

    @Override
    public String name() {
        return "Chords in key";
    }

    @Override
    public String configText() {
        return grabber.configText();
    }
}
