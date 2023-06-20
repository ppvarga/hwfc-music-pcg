package audioWfc.audio;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;

import java.util.HashSet;
import java.util.Set;

public class BasicChordRealizer {

    public static Set<PlayableNote> realize(Chord chord, int startTime, int endTime){
        Set<PlayableNote> out = new HashSet<>();

        int rootValue = new OctavedNote(3, chord.getRoot()).MIDIValue();

        for(int relativeValue : chord.noteValues()){
            OctavedNote octavedNote = OctavedNote.ofMIDIValue(rootValue + relativeValue);
            out.add(new PlayableNote(octavedNote, startTime, endTime, 60));
        }

        return out;
    }
}
