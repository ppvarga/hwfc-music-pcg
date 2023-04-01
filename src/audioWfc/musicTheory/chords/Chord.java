package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteSet;

import java.text.ParseException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import static audioWfc.musicTheory.chords.ChordQuality.MAJOR;
import static audioWfc.musicTheory.chords.ChordQuality.MINOR;

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

    public static Set<Chord> getAllBasicChords(){
        Set<Chord> out = new HashSet<>();
        for (Note root : Note.values()){
            for (ChordQuality quality : Set.of(MAJOR, MINOR)){
                out.add(create(root, quality));
            }
        }
        return out;
    }

    public static Chord parse(String s) {
        Note rootNote;
        ChordQuality chordQuality;

        s = s.trim();

        // Parse the root note from the chord string
        if (s.length() == 1) {
            return new MajorChord(Note.valueOf(s.toUpperCase(Locale.ROOT)));
        } else if (s.length() == 2 && s.charAt(1) == 'm'){
            return new MinorChord(Note.valueOf(String.valueOf(Character.toUpperCase(s.charAt(0)))));
        } else if (s.charAt(1) == '#') {
            String rootNoteStr = s.substring(0, 2).replace("#", "S").toUpperCase(Locale.ROOT);
            rootNote = Note.valueOf(rootNoteStr);
            if (s.length() == 2) {
                return new MajorChord(rootNote);
            } else if (s.length() == 3 && (s.charAt(2) == 'm')) {
                return new MinorChord(rootNote);
            }
        }
        throw new RuntimeException("Invalid chord:" + s);
    }

    public static Set<Chord> parseSet(String s) {
        String[] chordStrings = s.trim().split("\\s+");
        return Arrays.stream(chordStrings)
                .map(Chord::parse)
                .collect(Collectors.toSet());
    }



}
