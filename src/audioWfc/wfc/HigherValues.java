package audioWfc.wfc;

import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.rhythm.RhythmPattern;
import audioWfc.wfc.hierarchy.prototypes.Section;

public class HigherValues {
    private Key key;
    private Section section;
    private Chord chord;
    private RhythmPattern rhythmPattern;

    public HigherValues() {
    }

    public HigherValues copy() {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(section);
        out.setChord(chord);
        out.setRhythmPattern(rhythmPattern);
        return out;
    }

    public HigherValues copyWithChord(Chord otherChord) {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(section);
        out.setChord(otherChord);
        out.setRhythmPattern(rhythmPattern);
        return out;
    }

    public HigherValues copyWithSection(Section otherSection) {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(otherSection);
        out.setChord(chord);
        out.setRhythmPattern(rhythmPattern);
        return out;
    }

    public HigherValues copyWithKey(Key otherKey) {
        HigherValues out = new HigherValues();
        out.setKey(otherKey);
        out.setSection(section);
        out.setChord(chord);
        out.setRhythmPattern(rhythmPattern);
        return out;
    }

    public HigherValues copyWithRhythmPattern(RhythmPattern otherRhythmPattern) {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(section);
        out.setChord(chord);
        out.setRhythmPattern(otherRhythmPattern);
        return out;
    }

    public Key getKey() {
        return key;
    }

    public void setKey(Key key) {
        this.key = key;
    }

    public Section getSection() {
        return section;
    }

    public void setSection(Section section) {
        this.section = section;
    }

    public Chord getChord() {
        return chord;
    }

    public void setChord(Chord chord) {
        this.chord = chord;
    }

    public RhythmPattern getRhythmPattern() {
        return rhythmPattern;
    }

    public void setRhythmPattern(RhythmPattern rhythmPattern) {
        this.rhythmPattern = rhythmPattern;
    }
}
