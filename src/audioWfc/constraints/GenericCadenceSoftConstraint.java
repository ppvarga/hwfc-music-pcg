package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;


public class GenericCadenceSoftConstraint implements SoftConstraint<Chord>{
    private double factor;
    private Chord firstChord;
    private Chord secondChord;

    public GenericCadenceSoftConstraint(double factor, Key key,
                                         int firstOffset, ChordQuality firstQuality,
                                         int secondOffset, ChordQuality secondQuality){
        this.factor = factor;

        Note root = key.getRoot();

        Note firstRoot = NoteUtils.relativeNote(root, firstOffset);
        this.firstChord = Chord.create(firstRoot, firstQuality);

        Note secondRoot = NoteUtils.relativeNote(root, secondOffset);
        this.secondChord = Chord.create(secondRoot, secondQuality);
    }

    @Override
    public double weight(Tile<Chord> tile) {
        Chord chord = tile.getValue();

        if(chord.equals(secondChord)){
            Tile<Chord> prev = tile.getPrev();
            if(prev.isCollapsed() && prev.getValue().equals(firstChord)){
                return factor;
            }
        } else if(chord.equals(firstChord)){
            Tile<Chord> next = tile.getNext();
            if(next.isCollapsed() && next.getValue().equals(secondChord)){
                return factor;
            }
        }
        return 0d;
    }
}
