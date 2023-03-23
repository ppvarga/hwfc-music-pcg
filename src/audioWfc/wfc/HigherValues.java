package audioWfc.wfc;

import audioWfc.musicTheory.Section;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.Chord;

public class HigherValues {
    private Key key;
    private Section section;
    private Chord chord;

    public HigherValues() {
    }

    public HigherValues copy() {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(section);
        out.setChord(chord);
        return out;
    }

    public HigherValues copyWithChord(Chord otherChord) {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(section);
        out.setChord(otherChord);
        return out;
    }

    public HigherValues copyWithKey(Key otherKey) {
        HigherValues out = new HigherValues();
        out.setKey(otherKey);
        out.setSection(section);
        out.setChord(chord);
        return out;
    }

    public HigherValues copyWithChord(Section otherSection) {
        HigherValues out = new HigherValues();
        out.setKey(key);
        out.setSection(otherSection);
        out.setChord(chord);
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
}
