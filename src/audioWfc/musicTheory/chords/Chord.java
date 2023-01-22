package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteSet;

public abstract class Chord extends NoteSet {
    protected Note third;
    protected Note fifth;

    abstract String notation();

    abstract ChordQuality quality();

    @Override
    public String toString() {
        return "Chord: " + root + notation();
    }

    public Note getThird() {
        return third;
    }

    public Note getFifth() {
        return fifth;
    }

    public static Chord create(Note root, ChordQuality quality){
        switch (quality){
            case MAJOR -> {return new MajorChord(root);}
            case MINOR -> {return new MinorChord(root);}
            case DIMINISHED -> {return new DiminishedChord(root);}
            case AUGMENTED -> {return new AugmentedChord(root);}
            default -> {throw new RuntimeException("Unknown chord quality");}
        }
    }
}
