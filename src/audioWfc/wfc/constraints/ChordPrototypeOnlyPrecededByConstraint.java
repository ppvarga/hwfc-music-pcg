package audioWfc.wfc.constraints;

import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import java.util.Set;

public class ChordPrototypeOnlyPrecededByConstraint implements HardConstraint<Chordesque> {
    private Grabber<Set<Chord>> precedingChordsGrabber;
    private String chordPrototypeName;

    public ChordPrototypeOnlyPrecededByConstraint(Grabber<Set<Chord>> precedingChordsGrabber, String chordPrototypeName) {
        this.precedingChordsGrabber = precedingChordsGrabber;
        this.chordPrototypeName = chordPrototypeName;
    }

    @Override
    public String name() {
        return "Section is followed by";
    }

    @Override
    public String configText() {
        return precedingChordsGrabber.configText();
    }

    @Override
    public boolean check(Tile<Chordesque> tile, HigherValues higherValues) {
        Chordesque chordesque = tile.getValue();
        boolean out = true;

        Tile<Chordesque> prevTile = tile.getPrev();
        if(prevTile.isCollapsed()){
            out &= check(prevTile.getValue(), chordesque, higherValues);
        }

        Tile<Chordesque> nextTile = tile.getNext();
        if(prevTile.isCollapsed()){
            out &= check(chordesque, nextTile.getValue(), higherValues);
        }

        return out;
    }

    private boolean check(Chordesque a, Chordesque b, HigherValues higherValues){
        if(!(b instanceof ChordPrototype c))return true;
        if (!c.getName().equals(chordPrototypeName)) return true;
        Set<Chord> precedingChords = precedingChordsGrabber.grab(higherValues);
        return precedingChords.contains(a.getValue());
    }
}
