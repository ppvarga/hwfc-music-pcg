package audioWfc.gui;

import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.OptionsPerCell;
import audioWfc.wfc.constraints.AscendingMelodySoftConstraint;
import audioWfc.wfc.constraints.ChordInKeyConstraint;
import audioWfc.wfc.constraints.ChordStepSizeHardConstraint;
import audioWfc.wfc.constraints.DescendingMelodySoftConstraint;
import audioWfc.wfc.constraints.MelodyAbsoluteStepSizeHardConstraint;
import audioWfc.wfc.constraints.MelodyShapeHardConstraint;
import audioWfc.wfc.constraints.MelodyStartsOnNoteHardConstraint;
import audioWfc.wfc.constraints.NoteInKeyHardConstraint;
import audioWfc.wfc.constraints.NoteInOctavesConstraint;
import audioWfc.wfc.constraints.PerfectCadenceSoftConstraint;
import audioWfc.wfc.constraints.PlagalCadenceSoftConstraint;
import audioWfc.wfc.constraints.concepts.Constraint;
import audioWfc.wfc.constraints.concepts.MelodyShape;
import audioWfc.wfc.grabbers.BasicKeyGrabber;
import audioWfc.wfc.grabbers.BasicMelodyShapeGrabber;
import audioWfc.wfc.grabbers.FifthOfChordGrabber;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.wfc.grabbers.IntegerSetConstantGrabber;
import audioWfc.wfc.grabbers.RootOfChordGrabber;
import audioWfc.wfc.grabbers.ThirdOfChordGrabber;
import audioWfc.wfc.hierarchy.ChordLevelNode;
import audioWfc.wfc.hierarchy.ChordResult;
import audioWfc.wfc.hierarchy.NoteLevelNode;

import java.awt.FlowLayout;
import java.awt.event.*;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.swing.*;

import static audioWfc.musicTheory.Note.C;

public class MyApp extends JFrame {
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

    private JComboBox<String> noteConstraintComboBox;
    private JComboBox<String> chordConstraintComboBox;
    private JComboBox<String> noteGrabberComboBox;
    private JButton addNoteConstraintButton;
    private JButton addChordConstraintButton;
    private JButton configureNoteConstraintButton;
    private JButton configureChordConstraintButton;
    private JButton generateButton;
    private JButton resetButton;
    private JLabel constraintsLabel;
    private TextFieldWithTitle weightTextField;
    private TextFieldWithTitle integerSetTextField;
    private TextFieldWithTitle melodyShapeTextField;

    private ConstraintSet<OctavedNote> noteConstraints;
    private OptionsPerCell<OctavedNote> noteOptionsPerCell;
    private ConstraintSet<Chord> chordConstraints;
    private OptionsPerCell<Chord> chordOptionsPerCell;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteCanvasAttributes;
    private CanvasAttributes<Chord> chordCanvasAttributes;
    private NoteLevelNode noteLevelNode;
    private ChordLevelNode chordLevelNode;

    public MyApp() {
        noteConstraints = new ConstraintSet<>();
        noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());
        chordConstraints = new ConstraintSet<>();
        chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        higherValues = new HigherValues();
        higherValues.setKey(new MajorKey(C));
        noteCanvasAttributes =
                new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 4);
        chordCanvasAttributes = new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, 8);
        noteLevelNode = new NoteLevelNode(null, higherValues, noteCanvasAttributes, new Random());
        chordLevelNode = new ChordLevelNode(null,higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());
        setupGUI();
    }

    private void setupGUI() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setTitle("My GUI");
        setSize(800, 600);
        setLayout(new FlowLayout());

        noteConstraintComboBox = new JComboBox<>(new String[]{
                MELODY_IN_KEY,
                MELODY_STEP_SIZES,
                ASCENDING_MELODY,
                DESCENDING_MELODY,
                START_MELODY_ON_NOTE,
                MELODY_IN_OCTAVES,
                MELODY_SHAPE
        });
        add(noteConstraintComboBox);

        configureNoteConstraintButton = new JButton("Configure note constraint");
        configureNoteConstraintButton.addActionListener(this::configureNoteConstraint);
        add(configureNoteConstraintButton);


        chordConstraintComboBox = new JComboBox<>(new String[]{
                CHORDS_IN_KEY,
                DISTANCES_BETWEEN_ADJACENT_CHORDS,
                PERFECT_CADENCES,
                PLAGAL_CADENCES
        });
        add(chordConstraintComboBox);

        configureChordConstraintButton = new JButton("Configure chord constraint");
        configureChordConstraintButton.addActionListener(this::configureChordConstraint);
        add(configureChordConstraintButton);

        weightTextField = new TextFieldWithTitle("Soft constraint weights");
        add(weightTextField);

        integerSetTextField = new TextFieldWithTitle("Integer set");
        add(integerSetTextField);

        melodyShapeTextField = new TextFieldWithTitle(MELODY_SHAPE);
        add(melodyShapeTextField);

        noteGrabberComboBox = new JComboBox<>(new String[]{
                CHORD_ROOT,
                CHORD_THIRD,
                CHORD_FIFTH
        });
        add(noteGrabberComboBox);

        addNoteConstraintButton = new JButton("Add note constraint");
        addNoteConstraintButton.addActionListener(this::addNoteConstraint);
        add(addNoteConstraintButton);

        addChordConstraintButton = new JButton("Add chord constraint");
        addChordConstraintButton.addActionListener(this::addChordConstraint);
        add(addChordConstraintButton);

        generateButton = new JButton("Generate");
        generateButton.addActionListener(this::generate);
        add(generateButton);

        resetButton = new JButton("Reset");
        resetButton.addActionListener(this::reset);
        add(resetButton);

        constraintsLabel = new JLabel("\n");
        add(constraintsLabel);

        enterMainMode();
        setVisible(true);
    }

    public AscendingMelodySoftConstraint createAscendingMelodySoftConstraint(){
        double weight = Double.parseDouble(weightTextField.getText());
        return new AscendingMelodySoftConstraint(weight);
    }

    public DescendingMelodySoftConstraint createDescendingMelodySoftConstraint(){
        double weight = Double.parseDouble(weightTextField.getText());
        return new DescendingMelodySoftConstraint(weight);
    }

    public PerfectCadenceSoftConstraint createPerfectCadenceSoftConstraint(){
        double weight = Double.parseDouble(weightTextField.getText());
        return new PerfectCadenceSoftConstraint(weight, new BasicKeyGrabber());
    }

    public PlagalCadenceSoftConstraint createPlagalCadenceSoftConstraint(){
        double weight = Double.parseDouble(weightTextField.getText());
        return new PlagalCadenceSoftConstraint(weight, new BasicKeyGrabber());
    }

    public MelodyAbsoluteStepSizeHardConstraint createMelodyStepSizeHardConstraint(){
        Set<Integer> integerSet = parseIntegerSet(integerSetTextField.getText(), true);
        return new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(integerSet));
    }

    public NoteInOctavesConstraint createNoteInOctavesConstraint(){
        Set<Integer> integerSet = parseIntegerSet(integerSetTextField.getText(), true);
        return new NoteInOctavesConstraint(new IntegerSetConstantGrabber(integerSet));
    }

    public ChordStepSizeHardConstraint createChordStepSizeConstraint(){
        Set<Integer> integerSet = parseIntegerSet(integerSetTextField.getText(), true);
        return new ChordStepSizeHardConstraint(new IntegerSetConstantGrabber(integerSet));
    }

    public MelodyShapeHardConstraint createMelodyShapeHardConstraint(){
        MelodyShape shape = MelodyShape.parse(melodyShapeTextField.getText());
        return new MelodyShapeHardConstraint(new BasicMelodyShapeGrabber(shape));
    }

    private Grabber<Note> createNoteGrabber(){
        String selectedOption = (String) noteGrabberComboBox.getSelectedItem();
        Grabber<Note> out;
        switch (selectedOption) {
            case CHORD_ROOT -> {out = new RootOfChordGrabber();}
            case CHORD_THIRD -> {out = new ThirdOfChordGrabber();}
            case CHORD_FIFTH -> {out = new FifthOfChordGrabber();}
            default -> throw new RuntimeException("Unknown option");
        }
        return out;
    }

    public static Set<Integer> parseIntegerSet(String s, boolean notEmpty) throws IllegalArgumentException {
        Set<Integer> integerSet = Stream.of(s.split("\\s+")) // split the input string by whitespace and create a stream
                .filter(str -> str.matches("-?\\d+")) // filter out non-integer strings
                .map(Integer::parseInt) // convert strings to integers
                .collect(Collectors.toSet()); // collect the integers into a set
        if (notEmpty && integerSet.isEmpty()) {
            throw new IllegalArgumentException("Set cannot be empty.");
        }
        return integerSet;
    }

    //Placeholder for communication with user
    public void alert(String s){
        System.out.println(s);
    }

    private void enterConfigMode(){
        Set<JComponent> componentsToHide = Set.of(
                noteConstraintComboBox,
                configureNoteConstraintButton,
                chordConstraintComboBox,
                configureChordConstraintButton,
                resetButton,
                generateButton
        );
        for(JComponent component : componentsToHide){
            component.setVisible(false);
        }
    }

    private void enterMainMode(){
        Set<JComponent> componentsToHide = Set.of(
                addNoteConstraintButton,
                addChordConstraintButton,
                integerSetTextField,
                melodyShapeTextField,
                weightTextField,
                noteGrabberComboBox
        );
        for(JComponent component : componentsToHide){
            component.setVisible(false);
        }
        Set<JComponent> componentsToShow = Set.of(
                noteConstraintComboBox,
                chordConstraintComboBox,
                configureNoteConstraintButton,
                configureChordConstraintButton,
                generateButton,
                resetButton,
                constraintsLabel
        );
        for(JComponent component : componentsToShow){
            component.setVisible(true);
        }
    }

    public void configureNoteConstraint(ActionEvent e) {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();
        if(constraintsLabel.getText().contains(selectedOption)){
            alert("Constraint already exists");
        } else {
            enterConfigMode();
            Set<JComponent> componentsToShow = new HashSet<>();
            switch (selectedOption) {
                case MELODY_STEP_SIZES, MELODY_IN_OCTAVES -> componentsToShow.add(integerSetTextField);
                case ASCENDING_MELODY, DESCENDING_MELODY -> componentsToShow.add(weightTextField);
                case START_MELODY_ON_NOTE -> componentsToShow.add(noteGrabberComboBox);
                case MELODY_SHAPE -> componentsToShow.add(melodyShapeTextField);
            }
            if(componentsToShow.isEmpty()){
                addNoteConstraint();
                return;
            }
            componentsToShow.add(addNoteConstraintButton);
            for(JComponent component : componentsToShow){
                component.setVisible(true);
            }
        }
    }

    public void addNoteConstraint(ActionEvent e) {
        addNoteConstraint();
    }

    private void addNoteConstraint() {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();

        Constraint<OctavedNote> newConstraint;
        switch (selectedOption) {
            case MELODY_IN_KEY -> {newConstraint = new NoteInKeyHardConstraint(new BasicKeyGrabber());}
            case MELODY_STEP_SIZES -> {newConstraint = createMelodyStepSizeHardConstraint();}
            case ASCENDING_MELODY -> {newConstraint = createAscendingMelodySoftConstraint();}
            case DESCENDING_MELODY -> {newConstraint = createDescendingMelodySoftConstraint();}
            case START_MELODY_ON_NOTE -> {newConstraint = new MelodyStartsOnNoteHardConstraint(createNoteGrabber());}
            case MELODY_IN_OCTAVES -> {newConstraint = createNoteInOctavesConstraint();}
            case MELODY_SHAPE -> {newConstraint = createMelodyShapeHardConstraint();}
            default -> throw new RuntimeException("Unknown option");
        }
        noteConstraints.addConstraint(newConstraint);
        constraintsLabel.setText(multiline(constraintsLabel.getText()+ selectedOption + "\n" ));
        enterMainMode();
    }

    public void configureChordConstraint(ActionEvent e) {
        String selectedOption = (String) chordConstraintComboBox.getSelectedItem();
        if(constraintsLabel.getText().contains(selectedOption)){
            alert("Constraint already exists");
        } else {
            enterConfigMode();
            Set<JComponent> componentsToShow = new HashSet<>();
            switch (selectedOption) {
                case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {componentsToShow.add(integerSetTextField);}
                case PERFECT_CADENCES, PLAGAL_CADENCES -> {componentsToShow.add(weightTextField);}
            }
            if(componentsToShow.isEmpty()){
                addChordConstraint();
                return;
            }
            componentsToShow.add(addChordConstraintButton);
            for(JComponent component : componentsToShow){
                component.setVisible(true);
            }
        }
    }

    public void addChordConstraint(ActionEvent e) {
        addChordConstraint();
    }

    private void addChordConstraint() {
        String selectedOption = (String) chordConstraintComboBox.getSelectedItem();
        Constraint<Chord> newConstraint;
        switch (selectedOption) {
            case CHORDS_IN_KEY -> {newConstraint = new ChordInKeyConstraint(new BasicKeyGrabber());}
            case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {newConstraint = createChordStepSizeConstraint();}
            case PERFECT_CADENCES -> {newConstraint = createPerfectCadenceSoftConstraint();}
            case PLAGAL_CADENCES -> {newConstraint = createPlagalCadenceSoftConstraint();}
            default -> throw new RuntimeException("Unknown option");
        }
        chordConstraints.addConstraint(newConstraint);
        constraintsLabel.setText(multiline(constraintsLabel.getText()+ selectedOption + "\n" ));
        enterMainMode();
    }

    public void generate(ActionEvent e) {
        noteLevelNode = new NoteLevelNode(null, higherValues, noteCanvasAttributes, new Random());
        chordLevelNode = new ChordLevelNode(null, higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());
        List<ChordResult> result = chordLevelNode.generate();
        System.out.println(result);
    }

    public void reset(ActionEvent e) {
        alert("Constraints cleared");
        noteConstraints.reset();
        chordConstraints.reset();

        constraintsLabel.setText("\n");
    }

    public static void main(String[] args) {
        new MyApp();
    }

    public static String multiline(String s)
    {
        return "<html>" + s.replaceAll("\n", "<br>");
    }
}
