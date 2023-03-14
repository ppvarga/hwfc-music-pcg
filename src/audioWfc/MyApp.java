package audioWfc;

import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.OptionsPerCell;
import audioWfc.wfc.constraints.AscendingMelodySoftConstraint;
import audioWfc.wfc.constraints.MelodyAbsoluteStepSizeHardConstraint;
import audioWfc.wfc.constraints.NoteInKeyHardConstraint;
import audioWfc.wfc.constraints.NoteInOctavesConstraint;
import audioWfc.wfc.grabbers.BasicKeyGrabber;
import audioWfc.wfc.grabbers.IntegerSetConstantGrabber;
import audioWfc.wfc.hierarchy.NoteLevelNode;

import java.awt.FlowLayout;
import java.awt.event.*;
import java.util.List;
import java.util.Random;
import java.util.Set;
import javax.swing.*;

import static audioWfc.musicTheory.Note.C;

public class MyApp extends JFrame {
    private JComboBox<String> comboBox;
    private JButton addConstraintButton;
    private JButton generateButton;
    private JButton resetButton;
    private JLabel constraintsLabel;

    private ConstraintSet<OctavedNote> noteConstraints;
    private OptionsPerCell<OctavedNote> noteOptionsPerCell;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteCanvasAttributes;
    private NoteLevelNode noteLevelNode;

    public MyApp() {
        noteConstraints = new ConstraintSet<>(Set.of(
                new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5)))
        ));
        noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());
        higherValues = new HigherValues();
        higherValues.setKey(new MajorKey(C));
        noteCanvasAttributes =
                new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 8);
        noteLevelNode = new NoteLevelNode(null, higherValues, noteCanvasAttributes, new Random());
        setupGUI();
    }

    private void setupGUI() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setTitle("My GUI");
        setSize(300, 200);
        setLayout(new FlowLayout());

        comboBox = new JComboBox<>(new String[]{"In key", "Small steps", "Ascending"});
        add(comboBox);

        addConstraintButton = new JButton("Add");
        addConstraintButton.addActionListener(this::addConstraint);
        add(addConstraintButton);

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

    public void addConstraint(ActionEvent e) {
        String selectedOption = (String) comboBox.getSelectedItem();
        if(constraintsLabel.getText().contains(selectedOption)){
            System.out.println("Constraint already exists");
        } else {
            switch (selectedOption) {
                case "In key" -> noteConstraints.addHardConstraint(new NoteInKeyHardConstraint(new BasicKeyGrabber()));
                case "Small steps" -> noteConstraints.addHardConstraint(new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1, 2))));
                case "Ascending" -> noteConstraints.addSoftConstraint(new AscendingMelodySoftConstraint(100d));
                default -> throw new RuntimeException("Unknown option");
            }
            constraintsLabel.setText(multiline(constraintsLabel.getText()+ selectedOption + "\n" ));
        }
    }

    public void generate(ActionEvent e) {
        noteLevelNode = new NoteLevelNode(null, higherValues, noteCanvasAttributes, new Random());
        List<OctavedNote> result = noteLevelNode.generate();
        System.out.println(result);
    }

    public void reset(ActionEvent e) {
        System.out.println("Constraints cleared");
        noteConstraints.reset(Set.of(new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5)))));

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
