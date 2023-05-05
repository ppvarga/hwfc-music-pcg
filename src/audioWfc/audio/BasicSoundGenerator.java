package audioWfc.audio;

import audioWfc.wfc.hierarchy.ChordResult;
import audioWfc.wfc.hierarchy.SectionResult;

import javax.sound.midi.Sequencer;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class BasicSoundGenerator {
    public static void playChords(List<ChordResult> input){
        Set<PlayableNote> playableNotes = SequencerBuilder.getPlayableNotesFromChords(input);

        play(playableNotes);
    }

    private static void play(Set<PlayableNote> playableNotes) {
        Sequencer sequencer = SequencerBuilder.buildSequencer(playableNotes);
        MidiPlayer player = new MidiPlayer(sequencer);
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        player.start();
    }

    public static void playSections(List<SectionResult> input){
        Set<PlayableNote> playableNotes = SequencerBuilder.getPlayableNotesFromSections(input);

        play(playableNotes);
    }


}
