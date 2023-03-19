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
import audioWfc.wfc.constraints.MelodyStartsOnNoteHardConstraint;
import audioWfc.wfc.constraints.NoteInKeyHardConstraint;
import audioWfc.wfc.constraints.NoteInOctavesConstraint;
import audioWfc.wfc.constraints.PerfectCadenceSoftConstraint;
import audioWfc.wfc.constraints.PlagalCadenceSoftConstraint;
import audioWfc.wfc.constraints.concepts.Constraint;
import audioWfc.wfc.grabbers.BasicKeyGrabber;
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
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.swing.*;

import static audioWfc.musicTheory.Note.C;

public class MyApp extends JFrame {
    private JComboBox<String> noteConstraintComboBox;
    private JComboBox<String> chordConstraintComboBox;
    private JComboBox<String> noteGrabberComboBox;
    private JButton addNoteConstraintButton;
    private JButton addChordConstraintButton;
    private JButton generateButton;
    private JButton resetButton;
    private JLabel constraintsLabel;
    private TextFieldWithTitle weightTextField;
    private TextFieldWithTitle integerSetTextField;

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
                "Melody in key",
                "Melody step sizes",
                "Ascending melody",
                "Descending melody",
                "Start melody on note",
                "Melody in octaves"
        });
        add(noteConstraintComboBox);

        addNoteConstraintButton = new JButton("Add note constraint");
        addNoteConstraintButton.addActionListener(this::addNoteConstraint);
        add(addNoteConstraintButton);

        chordConstraintComboBox = new JComboBox<>(new String[]{
                "Chords in key",
                "Distances between adjacent chords",
                "Perfect cadences",
                "Plagal cadences"
        });
        add(chordConstraintComboBox);

        addChordConstraintButton = new JButton("Add chord constraint");
        addChordConstraintButton.addActionListener(this::addChordConstraint);
        add(addChordConstraintButton);

        weightTextField = new TextFieldWithTitle("Soft constraint weights");
        add(weightTextField);

        integerSetTextField = new TextFieldWithTitle("Integer set");
        add(integerSetTextField);

        noteGrabberComboBox = new JComboBox<>(new String[]{
                "Root of current chord",
                "Third of current chord",
                "Fifth of current chord"
        });
        add(noteGrabberComboBox);

        generateButton = new JButton("Generate");
        generateButton.addActionListener(this::generate);
        add(generateButton);

        resetButton = new JButton("Reset");
        resetButton.addActionListener(this::reset);
        add(resetButton);

        constraintsLabel = new JLabel("\n");
        add(constraintsLabel);

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

    private Grabber<Note> createNoteGrabber(){
        String selectedOption = (String) noteGrabberComboBox.getSelectedItem();
        Grabber<Note> out;
        switch (selectedOption) {
            case "Root of current chord" -> {out = new RootOfChordGrabber();}
            case "Third of current chord" -> {out = new ThirdOfChordGrabber();}
            case "Fifth of current chord" -> {out = new FifthOfChordGrabber();}
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

    public void addNoteConstraint(ActionEvent e) {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();
        if(constraintsLabel.getText().contains(selectedOption)){
            alert("Constraint already exists");
        } else {
            Constraint<OctavedNote> newConstraint;
            switch (selectedOption) {
                case "Melody in key" -> {newConstraint = new NoteInKeyHardConstraint(new BasicKeyGrabber());}
                case "Melody step sizes" -> {newConstraint = createMelodyStepSizeHardConstraint();}
                case "Ascending melody" -> {newConstraint = createAscendingMelodySoftConstraint();}
                case "Descending melody" -> {newConstraint = createDescendingMelodySoftConstraint();}
                case "Start melody on note" -> {newConstraint = new MelodyStartsOnNoteHardConstraint(createNoteGrabber());}
                case "Melody in octaves" -> {newConstraint = createNoteInOctavesConstraint();}
                default -> throw new RuntimeException("Unknown option");
            }
            noteConstraints.addConstraint(newConstraint);
            constraintsLabel.setText(multiline(constraintsLabel.getText()+ selectedOption + "\n" ));
        }
    }

    public void addChordConstraint(ActionEvent e) {
        String selectedOption = (String) chordConstraintComboBox.getSelectedItem();
        if(constraintsLabel.getText().contains(selectedOption)){
            alert("Constraint already exists");
        } else {
            Constraint<Chord> newConstraint;
            switch (selectedOption) {
                case "Chords in key" -> {newConstraint = new ChordInKeyConstraint(new BasicKeyGrabber());}
                case "Distances between adjacent chords" -> {newConstraint = createChordStepSizeConstraint();}
                case "Perfect cadences" -> {newConstraint = createPerfectCadenceSoftConstraint();}
                case "Plagal cadences" -> {newConstraint = createPlagalCadenceSoftConstraint();}
                default -> throw new RuntimeException("Unknown option");
            }
            chordConstraints.addConstraint(newConstraint);
            constraintsLabel.setText(multiline(constraintsLabel.getText()+ selectedOption + "\n" ));
        }
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
