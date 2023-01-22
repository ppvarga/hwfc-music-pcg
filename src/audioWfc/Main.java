package audioWfc;

import audioWfc.constraints.AscendingMelodySoftConstraint;
import audioWfc.constraints.ChordStepSizeHardConstraint;
import audioWfc.constraints.ChordsInKeyConstraint;
import audioWfc.constraints.Constraint;
import audioWfc.constraints.ConstraintSet;
import audioWfc.constraints.ConstraintUtils;
import audioWfc.constraints.MelodyShape;
import audioWfc.constraints.MelodyShapeHardConstraint;
import audioWfc.constraints.MelodyStartsOnNoteHardConstraint;
import audioWfc.constraints.MelodyStepSizeHardConstraint;
import audioWfc.constraints.NotesInKeyConstraint;
import audioWfc.constraints.PerfectCadenceSoftConstraint;
import audioWfc.constraints.PlagalCadenceSoftConstraint;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.OptionsPerCell;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;
import audioWfc.musicTheory.chords.MajorChord;
import audioWfc.musicTheory.chords.MinorChord;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

import static audioWfc.musicTheory.Note.*;

public class Main {
    public static void main(String[] args) {
        melodyShapeDemo();
    }

    private static void chordsAndNotesDemo() {
        Key key = new MajorKey(C);

        Set<Chord> chordOptions = key.getBasicChords();
        ConstraintSet<Chord> constraintSetChords = new ConstraintSet<>(Set.of(new ChordStepSizeHardConstraint(Set.of(3,4,5))));
        OptionsPerCell<Chord> optionsPerCell = new OptionsPerCell<>(chordOptions);
        optionsPerCell.setValue(2, new MajorChord(F));
        optionsPerCell.setOptions(5, Set.of(new MajorChord(C), new MinorChord(E)));

        TileCanvas<Chord> chordWFC = new TileCanvas<>(8, optionsPerCell, constraintSetChords, new Random());
        List<Chord> chords = chordWFC.generate();
        System.out.println(chords);

        for(Chord chord : chords){
            Set<Note> noteOptions = key.getNotes();
            ConstraintSet<Note> constraintSetNotes = new ConstraintSet<>(Set.of(
                    new MelodyStepSizeHardConstraint(Set.of(1,2,3)),
                    new MelodyStartsOnNoteHardConstraint(chord.getThird())
            ));
            TileCanvas<Note> noteWFC = new TileCanvas<>(4, noteOptions, constraintSetNotes, new Random());
            List<Note> melodySegment = noteWFC.generate();
            System.out.println(chord + " - " + melodySegment);
        }
    }

    private static void cadenceSoftConstraintsDemo(){
        Key key = new MajorKey(C);

        Set<Chord> chordOptions = key.getBasicChords();

        ConstraintSet<Chord> constraintSetChords = new ConstraintSet<>(Set.of(
                new PerfectCadenceSoftConstraint(100d, key),
                new PlagalCadenceSoftConstraint(50d, key)
        ));

        OptionsPerCell<Chord> optionsPerCell = new OptionsPerCell<>(chordOptions);
        for(int i = 0; i<8; i++){
            optionsPerCell.setValue(4*i, new MajorChord(C));
        }

        TileCanvas<Chord> chordWFC = new TileCanvas<>(32, optionsPerCell, constraintSetChords, new Random());

        List<Chord> chords = chordWFC.generate();
        System.out.println(chords);
    }

    private static void ascendingMelodyDemo() {
        Key key = new MajorKey(C);

        Set<Note> noteOptions = key.getNotes();
        ConstraintSet<Note> constraintSetNotes = new ConstraintSet<>(Set.of(
                new MelodyStepSizeHardConstraint(Set.of(1,2,3,4)),
                new AscendingMelodySoftConstraint(10)
        ));
        TileCanvas<Note> noteWFC = new TileCanvas<>(16, noteOptions, constraintSetNotes, new Random());
        List<Note> melodySegment = noteWFC.generate();
        System.out.println(melodySegment);
    }

    private static void melodyShapeDemo() {
        Key key = new MajorKey(C);

        Set<Note> noteOptions = key.getNotes();

        String melodyShapeString = "aasdaaswww";
        MelodyShape melodyShape = MelodyShape.parse(melodyShapeString);

        ConstraintSet<Note> constraintSetNotes = new ConstraintSet<>(Set.of(
                new MelodyStepSizeHardConstraint(Set.of(0,1,2,3)),
                new MelodyShapeHardConstraint(melodyShape)
        ));
        TileCanvas<Note> noteWFC = new TileCanvas<>(melodyShapeString.length()+1, noteOptions, constraintSetNotes, new Random());
        List<Note> melodySegment = noteWFC.generate();
        System.out.println(melodySegment);
    }
}
