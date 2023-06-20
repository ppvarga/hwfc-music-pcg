package audioWfc.wfc.constraints;

import audioWfc.wfc.constraints.concepts.Constraint;
import audioWfc.wfc.constraints.concepts.MelodyShape;
import audioWfc.wfc.grabbers.BasicKeyGrabber;
import audioWfc.wfc.grabbers.BasicMelodyShapeGrabber;
import audioWfc.wfc.grabbers.IntegerSetConstantGrabber;
import audioWfc.wfc.grabbers.RootOfChordGrabber;

import java.util.HashSet;
import java.util.Set;

public class ConstraintUtils {
    public static final String MELODY_STEP_SIZES = "Melody step sizes";
    public static final String MELODY_IN_KEY = "Melody in key";
    public static final String ASCENDING_MELODY = "Ascending melody";
    public static final String DESCENDING_MELODY = "Descending melody";
    public static final String START_MELODY_ON_NOTE = "Start melody on note";
    public static final String MELODY_IN_OCTAVES = "Melody in octaves";
    public static final String MELODY_SHAPE = "Melody shape";
    public static final String CHORDS_IN_KEY = "Chords in key";
    public static final String DISTANCES_BETWEEN_ADJACENT_CHORDS = "Distances between adjacent chords";
    public static final String PERFECT_CADENCES = "Perfect cadences";
    public static final String PLAGAL_CADENCES = "Plagal cadences";
    public static final String CHORD_ROOT = "Root of current chord";
    public static final String CHORD_THIRD = "Third of current chord";
    public static final String CHORD_FIFTH = "Fifth of current chord";

    public static final Set<String> allNoteConstraints = Set.of(
            MELODY_SHAPE,
            MELODY_IN_OCTAVES,
            MELODY_STEP_SIZES,
            MELODY_IN_KEY,
            ASCENDING_MELODY,
            DESCENDING_MELODY,
            START_MELODY_ON_NOTE
    );

    public static final Set<String> allChordConstraints = Set.of(
            PERFECT_CADENCES,
            PLAGAL_CADENCES,
            CHORDS_IN_KEY,
            DISTANCES_BETWEEN_ADJACENT_CHORDS
    );

    public static Constraint<?> constraintFromName(String name){
        switch (name){
            case MELODY_SHAPE -> {
                return new MelodyShapeHardConstraint(new BasicMelodyShapeGrabber(MelodyShape.parse("")));
            }
            case MELODY_IN_OCTAVES -> {
                return new NoteInOctavesConstraint(new IntegerSetConstantGrabber(new HashSet<>()));
            }
            case MELODY_STEP_SIZES -> {
                return new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(new HashSet<>()));
            }
            case MELODY_IN_KEY -> {
                return new NoteInKeyHardConstraint(new BasicKeyGrabber());
            }
            case ASCENDING_MELODY -> {
                return new AscendingMelodySoftConstraint(-1);
            }
            case DESCENDING_MELODY -> {
                return new DescendingMelodySoftConstraint(-1);
            }
            case START_MELODY_ON_NOTE -> {
                return new MelodyStartsOnNoteHardConstraint(new RootOfChordGrabber());
            }
            case PERFECT_CADENCES -> {
                return new PerfectCadenceSoftConstraint(-1, new BasicKeyGrabber());
            }
            case PLAGAL_CADENCES -> {
                return new PlagalCadenceSoftConstraint(-1, new BasicKeyGrabber());
            }
            case CHORDS_IN_KEY -> {
                return new ChordInKeyConstraint(new BasicKeyGrabber());
            }
            case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {
                return new ChordStepSizeHardConstraint(new IntegerSetConstantGrabber(new HashSet<>()));
            }
            default -> throw new IllegalArgumentException("No constraint with such name exists");
        }
    }

}
