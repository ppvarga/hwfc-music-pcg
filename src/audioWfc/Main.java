package audioWfc;

import audioWfc.constraints.ChordsInKeyConstraint;
import audioWfc.constraints.NotesInKeyConstraint;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.MajorKey;
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
        System.out.println(new ChordsInKeyConstraint(key).allowedTiles());
        System.out.println(new NotesInKeyConstraint(key).allowedTiles());
    }
}
