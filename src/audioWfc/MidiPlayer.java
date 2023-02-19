package audioWfc;

import javax.sound.midi.MetaEventListener;
import javax.sound.midi.MetaMessage;
import javax.sound.midi.MidiFileFormat;
import javax.sound.midi.Sequencer;

public class MidiPlayer implements MetaEventListener {
    private Sequencer sequencer;

    public MidiPlayer(Sequencer sequencer) {
        this.sequencer = sequencer;
    }

    public void start(){
        sequencer.start();
        sequencer.addMetaEventListener(this);
    }

    @Override
    public void meta(MetaMessage message) {
        if (message.getType() == 47){
            sequencer.stop();
            sequencer.close();
        }
    }
}
