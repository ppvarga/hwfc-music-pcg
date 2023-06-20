package audioWfc.audio;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.rhythm.RhythmUnit;
import audioWfc.wfc.hierarchy.ChordResult;
import audioWfc.wfc.hierarchy.ChordResultWithRhythm;
import audioWfc.wfc.hierarchy.SectionResult;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiEvent;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.Sequence;
import javax.sound.midi.Sequencer;
import javax.sound.midi.ShortMessage;
import javax.sound.midi.Track;
import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SequencerBuilder {

    private static final int START_NOTE = 144;
    private static final int END_NOTE = 128;
    private static final int CHANNEL = 1;
    public static final float DEFAULT_BPM = 120f;

    public static Sequencer buildSequencer(Set<PlayableNote> notes){
        try{
            Sequencer sequencer = MidiSystem.getSequencer();
            sequencer.open();
            Sequence sequence = getSequence(notes);

            sequencer.setSequence(sequence);

            sequencer.setTempoInBPM(DEFAULT_BPM);

            return sequencer;
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    public static Sequence getSequence(Set<PlayableNote> notes) throws InvalidMidiDataException, IOException {
        Sequence sequence = new Sequence(Sequence.PPQ, 4);
        Track track = sequence.createTrack();

        for(PlayableNote note : notes){
            track.add(makeEvent(START_NOTE, CHANNEL, note.pitch.MIDIValue(), note.velocity, note.start));

            track.add(makeEvent(END_NOTE, CHANNEL, note.pitch.MIDIValue(), note.velocity, note.end));
        }
        File outputFile = new File("output.mid");
        MidiSystem.write(sequence, 1, outputFile);
        return sequence;
    }

    public static Sequence getSequence(List<ChordResult> result) throws InvalidMidiDataException, IOException {
        return getSequence(SequencerBuilder.getPlayableNotesFromChords(result));
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

    public static Set<PlayableNote> getPlayableNotesFromChords(List<ChordResult> input) {
        int ticks = 1;
        final int noteLength = 4;

        Set<PlayableNote> playableNotes = new HashSet<>();

        addChordResult(input, ticks, noteLength, playableNotes);
        return playableNotes;
    }

    public static Set<PlayableNote> getPlayableNotesFromChordsWithRhythm(List<ChordResultWithRhythm> input) {
        int ticks = 1;
        final int noteLength = 4;

        Set<PlayableNote> playableNotes = new HashSet<>();

        addChordResultWithRhythm(input, ticks, noteLength, playableNotes);
        return playableNotes;
    }

    public static Set<PlayableNote> getPlayableNotesFromSections(List<SectionResult> input) {
        int ticks = 1;
        final int noteLength = 4;

        Set<PlayableNote> playableNotes = new HashSet<>();

        for(SectionResult sectionResult : input){
            ticks = addChordResult(sectionResult.chords(), ticks, noteLength, playableNotes);
        }
        return playableNotes;
    }

    private static int addChordResult(List<ChordResult> input, int ticks, int noteLength, Set<PlayableNote> playableNotes) {
        for(ChordResult chordResult : input){
            int chordStart = ticks;
            for(OctavedNote octavedNote : chordResult.notes()){
                PlayableNote playableNote = new PlayableNote(octavedNote, ticks, ticks + noteLength, 100);
                playableNotes.add(playableNote);
                ticks += noteLength;
            }
            playableNotes.addAll(BasicChordRealizer.realize(chordResult.chord(), chordStart, ticks));
        }
        return ticks;
    }

    private static int addChordResultWithRhythm(List<ChordResultWithRhythm> input, int ticks, int unitLength, Set<PlayableNote> playableNotes) {
        for(ChordResultWithRhythm chordResult : input){
            int chordStart = ticks;
            int noteCounter = 0;

            for(RhythmUnit rhythmUnit : chordResult.rhythmPattern().getPattern()){
                int length = rhythmUnit.getLength()*unitLength;
                if(rhythmUnit.isNote()){
                    PlayableNote playableNote = new PlayableNote(
                            chordResult.notes().get(noteCounter++),
                            ticks, ticks + length,
                            100);
                    playableNotes.add(playableNote);
                }
                ticks += length;
            }
            playableNotes.addAll(BasicChordRealizer.realize(chordResult.chord(), chordStart, ticks));
        }
        return ticks;
    }
}
