package audioWfc;

import javax.sound.midi.MidiEvent;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.Sequence;
import javax.sound.midi.Sequencer;
import javax.sound.midi.ShortMessage;
import javax.sound.midi.Track;
import java.util.Set;

public class SequencerBuilder {

    private static final int START_NOTE = 144;
    private static final int END_NOTE = 128;
    private static final int CHANNEL = 1;
    private static final float DEFAULT_BPM = 120f;

    public static Sequencer buildSequencer(Set<PlayableNote> notes){
        try{
            Sequencer sequencer = MidiSystem.getSequencer();
            sequencer.open();
            Sequence sequence = new Sequence(Sequence.PPQ, 4);
            Track track = sequence.createTrack();
            
            for(PlayableNote note : notes){
                track.add(makeEvent(START_NOTE, CHANNEL, note.pitch.MIDIValue(), note.velocity, note.start));

                track.add(makeEvent(END_NOTE, CHANNEL, note.pitch.MIDIValue(), note.velocity, note.end));
            }

            sequencer.setSequence(sequence);
            sequencer.setTempoInBPM(DEFAULT_BPM);

            return sequencer;
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    private static MidiEvent makeEvent(int command, int channel, int note, int velocity, int tick){
        MidiEvent event = null;

        try {
            ShortMessage a = new ShortMessage();
            a.setMessage(command, channel, note, velocity);

            event = new MidiEvent(a, tick);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return event;
    }
}
