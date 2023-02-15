package audioWfc;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static audioWfc.musicTheory.Note.*;

public class OctavedNote {
    int octave;
    Note note;

    public OctavedNote(int octave, Note note) {
        if(octave<-1 || octave >9) throw new IllegalArgumentException("Illegal octave number: " + octave);
        if(octave == 9 && (Set.of(GS, A, AS, B)).contains(note))
            throw new IllegalArgumentException("Note too high");

        this.octave = octave;
        this.note = note;
    }

    public static OctavedNote ofMIDIValue(int value){
        if(value < 0 || value > 127) throw new IllegalArgumentException("Illegal MIDI value: " + value);
        Note note = NoteUtils.intToNote(value % 12);
        int octave = (value/12) - 1;
        return new OctavedNote(octave, note);
    }

    public int MIDIValue(){
        return 12*(octave+1) + NoteUtils.noteToInt(note);
    }

    public int getOctave() {
        return octave;
    }

    public Note getNote() {
        return note;
    }

    public static Set<OctavedNote> all(){
        Set<OctavedNote> out = new HashSet<>();
        for(int i = 0; i<128; i++){
            out.add(OctavedNote.ofMIDIValue(i));
        }
        return out;
    }

    @Override
    public String toString() {
        return "" + note + octave;
    }
}
