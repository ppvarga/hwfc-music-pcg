package audioWfc.wfc.constraints;

import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;
import audioWfc.wfc.hierarchy.prototypes.Section;

import java.util.Set;

public class ChordPrototypeOnlyFollowedByConstraint implements HardConstraint<Chordesque> {
    private String chordPrototypeName;
    private Grabber<Set<Chord>> followingChordsGrabber;

    public ChordPrototypeOnlyFollowedByConstraint(String chordPrototypeName, Grabber<Set<Chord>> followingChordsGrabber) {
        this.chordPrototypeName = chordPrototypeName;
        this.followingChordsGrabber = followingChordsGrabber;
    }

    @Override
    public String name() {
        return "Section is followed by";
    }

    @Override
    public String configText() {
        return followingChordsGrabber.configText();
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
        if(!(a instanceof ChordPrototype c))return true;
        if (!c.getName().equals(chordPrototypeName)) return true;
        Set<Chord> followingChords = followingChordsGrabber.grab(higherValues);
        return followingChords.contains(b.getValue());
    }
}
