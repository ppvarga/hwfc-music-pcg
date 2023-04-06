package audioWfc.audio;

import audioWfc.wfc.hierarchy.ChordResult;

import javax.sound.midi.Sequencer;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class BasicSoundGenerator {
    public static void play(List<ChordResult> input){
        Set<PlayableNote> playableNotes = SequencerBuilder.getPlayableNotes(input);

        Sequencer sequencer = SequencerBuilder.buildSequencer(playableNotes);
        MidiPlayer player = new MidiPlayer(sequencer);
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        player.start();
    }

}
