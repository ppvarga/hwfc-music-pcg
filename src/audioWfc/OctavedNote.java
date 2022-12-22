package audioWfc;

import audioWfc.musicTheory.Note;

public class OctavedNote {
    int octave;
    Note note;

    public OctavedNote(int octave, Note note) {
        this.octave = octave;
        this.note = note;
    }

    public int pitch(){
        //TODO actual translation to MIDI pitch
        return 0;
    }
}
