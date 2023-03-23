package audioWfc.wfc.constraints.concepts;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;


public abstract class GenericCadenceSoftConstraint extends SoftConstraint<Chord> {
    private Grabber<Integer> firstOffsetGrabber;
    private Grabber<Integer> secondOffsetGrabber;
    private Grabber<ChordQuality> firstQualityGrabber;
    private Grabber<ChordQuality> secondQualityGrabber;
    protected Grabber<Key> keyGrabber;

    public GenericCadenceSoftConstraint(double factor, Grabber<Key> keyGrabber,
                                        Grabber<Integer> firstOffsetGrabber, Grabber<ChordQuality> firstQualityGrabber,
                                        Grabber<Integer> secondOffsetGrabber, Grabber<ChordQuality> secondQualityGrabber){
        super(factor);
        this.keyGrabber = keyGrabber;
        this.firstOffsetGrabber = firstOffsetGrabber;
        this.secondOffsetGrabber = secondOffsetGrabber;
        this.firstQualityGrabber = firstQualityGrabber;
        this.secondQualityGrabber = secondQualityGrabber;
    }

    @Override
    public double weight(Tile<Chord> tile, HigherValues higherValues) {
        Chord chord = tile.getValue();

        Note root = keyGrabber.grab(higherValues).getRoot();

        Note firstRoot = NoteUtils.relativeNote(root, firstOffsetGrabber.grab(higherValues));
        Chord firstChord = Chord.create(firstRoot, firstQualityGrabber.grab(higherValues));

        Note secondRoot = NoteUtils.relativeNote(root, secondOffsetGrabber.grab(higherValues));
        Chord secondChord = Chord.create(secondRoot, secondQualityGrabber.grab(higherValues));

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
