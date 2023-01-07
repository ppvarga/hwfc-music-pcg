package audioWfc;

import audioWfc.constraints.ChordStepSizeHardConstraint;
import audioWfc.constraints.ChordsInKeyConstraint;
import audioWfc.constraints.Constraint;
import audioWfc.constraints.ConstraintUtils;
import audioWfc.constraints.MelodyStepSizeHardConstraint;
import audioWfc.constraints.NotesInKeyConstraint;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static audioWfc.musicTheory.Note.C;

public class Main {
    public static void main(String[] args) {
        //basicWfcDemo();
        chordsAndNotesDemo();
    }

    private static void basicWfcDemo() {
        List<Integer> example = List.of(0,0,1,2,3,3);
        WFC<Integer> wfc = new WFC<>(example);

        System.out.println(wfc.generate(List.of(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(), Optional.of(1), Optional.empty(), Optional.empty())));
    }

    private static void chordsAndNotesDemo(){
        Key key = new MajorKey(C);
        Set<Chord> chordOptions = new ChordsInKeyConstraint(key).allowedTiles();
        Set<NeighborPair<Chord>> chordPairs = ConstraintUtils
                .applyHardConstraint(WFCUtils.allCombinationsNoRepeats(chordOptions),
                        new ChordStepSizeHardConstraint(Set.of(3,4,5)));
        //System.out.println("Chord pairs: " + chordPairs);

        WFC<Chord> chordWFC = new WFC<>(chordPairs);
        List<Chord> chordProgression = chordWFC.generate(8);
        System.out.println("Chord progression: " + chordProgression);

        Set<Note> noteOptions = new NotesInKeyConstraint(key).allowedTiles();
        Set<NeighborPair<Note>> notePairs = ConstraintUtils
                .applyHardConstraint(WFCUtils.allCombinations(noteOptions),
                        new MelodyStepSizeHardConstraint(Set.of(1,2,3)));

        for(Chord chord : chordProgression){
            WFC<Note> noteWFC = new WFC<>(notePairs);
            List<Note> melodySegment = noteWFC.generate(
                    List.of(Optional.of(chord.getThird()), Optional.empty(), Optional.empty(), Optional.empty()));
            System.out.println(chord + " - " + melodySegment);
        }

    }
}
