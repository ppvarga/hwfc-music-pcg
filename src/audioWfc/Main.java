package audioWfc;

import audioWfc.constraints.ChordStepSizeHardConstraint;
import audioWfc.constraints.ChordsInKeyConstraint;
import audioWfc.constraints.ConstraintUtils;
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
        Set<Chord> chords = new ChordsInKeyConstraint(key).allowedTiles();
        Set<NeighborPair<Chord>> chordPairs = ConstraintUtils
                .applyHardConstraint(WFCUtils.allCombinationsNoRepeats(chords),
                        new ChordStepSizeHardConstraint(Set.of(3,4)));
        System.out.println(chordPairs);



        Set<Note> notes = new NotesInKeyConstraint(key).allowedTiles();
        Set<NeighborPair<Note>> notePairs = WFCUtils.allCombinationsNoRepeats(notes);
    }
}
