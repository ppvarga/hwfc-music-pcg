package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;


public abstract class GenericCadenceSoftConstraint extends SoftConstraint<Chord>{
    private Chord firstChord;
    private Chord secondChord;

    private int firstOffset;
    private int secondOffset;
    private ChordQuality firstQuality;
    private ChordQuality secondQuality;

    private Grabber<Integer> firstOffsetGrabber;
    private Grabber<Integer> secondOffsetGrabber;
    private Grabber<ChordQuality> firstQualityGrabber;
    private Grabber<ChordQuality> secondQualityGrabber;
    private Grabber<Key> keyGrabber;

    public void init(){
        Note root = keyGrabber.grab().getRoot();

        Note firstRoot = NoteUtils.relativeNote(root, firstOffsetGrabber.grab());
        this.firstChord = Chord.create(firstRoot, firstQualityGrabber.grab());

        Note secondRoot = NoteUtils.relativeNote(root, secondOffsetGrabber.grab());
        this.secondChord = Chord.create(secondRoot, secondQualityGrabber.grab());
    }

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
