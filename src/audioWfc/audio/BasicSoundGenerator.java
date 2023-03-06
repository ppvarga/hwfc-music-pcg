package audioWfc.audio;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.hierarchy.ChordResult;

import javax.sound.midi.Sequencer;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BasicSoundGenerator {
    public static void play(List<ChordResult> input){
        int ticks = 1;
        final int noteLength = 4;

        Set<PlayableNote> playableNotes = new HashSet<>();

        for(ChordResult chordResult : input){
            int chordStart = ticks;
            for(OctavedNote octavedNote : chordResult.notes()){
                PlayableNote playableNote = new PlayableNote(octavedNote, ticks, ticks+noteLength, 100);
                playableNotes.add(playableNote);
                ticks += noteLength;
            }
            playableNotes.addAll(BasicChordRealizer.realize(chordResult.chord(), chordStart, ticks));
        }

        Sequencer sequencer = SequencerBuilder.buildSequencer(playableNotes);
        MidiPlayer player = new MidiPlayer(sequencer);
        player.start();
    }
}
