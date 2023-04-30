package audioWfc.gui;

import audioWfc.audio.BasicSoundGenerator;
import audioWfc.audio.MidiPlayer;
import audioWfc.musicTheory.Key;
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
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import java.awt.*;
import java.awt.event.*;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Sequence;
import javax.sound.midi.Sequencer;
import javax.swing.*;
import javax.swing.border.LineBorder;

import static audioWfc.audio.SequencerBuilder.DEFAULT_BPM;
import static audioWfc.audio.SequencerBuilder.getSequence;

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

    private static final Set<String> allNoteConstraints = Set.of(
            MELODY_SHAPE,
            MELODY_IN_OCTAVES,
            MELODY_STEP_SIZES,
            MELODY_IN_KEY,
            ASCENDING_MELODY,
            DESCENDING_MELODY,
            START_MELODY_ON_NOTE
    );

    private static final Set<String> allChordConstraints = Set.of(
            PERFECT_CADENCES,
            PLAGAL_CADENCES,
            CHORDS_IN_KEY,
            DISTANCES_BETWEEN_ADJACENT_CHORDS
    );

    private JComboBox<String> noteConstraintComboBox;
    private JComboBox<String> chordConstraintComboBox;
    private JComboBox<String> noteGrabberComboBox;
    private JButton addNoteConstraintButton;
    private JButton addChordConstraintButton;
    private JButton configureNoteConstraintButton;
    private JButton configureChordConstraintButton;
    private JPanel configureOptionsPerCellPanel;
    private JButton configureChordOptionsPerCellButton;
    private JButton resetChordOptionsPerCellButton;
    private JPanel initializedChordOptionsPerCellPanel;
    private TextFieldWithTitle optionsPerCellPositionField;
    private TextFieldWithTitle optionsPerCellValueField;
    private JButton addChordOptionsPerCellButton;
    private JPanel mainContainer;
    private JPanel globalParametersPanel;
    private JPanel addConstraintsPanel;
    private JPanel addNoteConstraintPanel;
    private JPanel addChordConstraintPanel;
    private JPanel initializedConstraintsPanel;
    private JPanel operationsPanel;
    private JButton generateButton;
    private JButton playButton;
    private JButton resetButton;
    private JLabel constraintsLabel;
    private TextFieldWithTitle keyTextField;
    private TextFieldWithTitle numChordsTextField;
    private TextFieldWithTitle notesPerChordTextField;
    private TextFieldWithTitle weightTextField;
    private TextFieldWithTitle integerSetTextField;
    private TextFieldWithTitle melodyShapeTextField;

    private ConstraintSet<OctavedNote> noteConstraints;
    private OptionsPerCell<OctavedNote> noteOptionsPerCell;
    private ConstraintSet<Chordesque> chordConstraints;
    private OptionsPerCell<Chordesque> chordOptionsPerCell;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteCanvasAttributes;
    private CanvasAttributes<Chordesque> chordCanvasAttributes;
    private ChordLevelNode chordLevelNode;
    private List<ChordResult> lastResult;
    private Set<String> usedConstraintTypes;
    private Set<Integer> usedChordOptionPositions;

    private Sequencer sequencer;
    private MidiPlayer midiPlayer;

    public MyApp() {
        noteConstraints = new ConstraintSet<>();
        noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());
        chordConstraints = new ConstraintSet<>();
        chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        higherValues = new HigherValues();
        chordCanvasAttributes = new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, 0);
        noteCanvasAttributes = new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 0);
        usedConstraintTypes = new HashSet<>();
        usedChordOptionPositions = new HashSet<>();

        try {
            sequencer = MidiSystem.getSequencer();
            sequencer.open();
        } catch (MidiUnavailableException e) {
            e.printStackTrace();
        }
        sequencer.setTempoInBPM(DEFAULT_BPM);
        midiPlayer = new MidiPlayer(sequencer);

        setupGUI();
    }

    private void setupGUI() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setTitle("My GUI");
        setSize(500, 800);
        setLayout(new FlowLayout());

        mainContainer = new JPanel();
        mainContainer.setLayout(new BoxLayout(mainContainer, BoxLayout.Y_AXIS));
        add(mainContainer);

        globalParametersPanel = new JPanel();
        GridBagConstraints globalParametersPanelGbc = new GridBagConstraints();
        globalParametersPanelGbc.anchor = GridBagConstraints.WEST;
        globalParametersPanelGbc.gridx = 0;
        globalParametersPanelGbc.gridy = 0;
        globalParametersPanel.setLayout(new GridBagLayout());
        mainContainer.add(globalParametersPanel);

        mainContainer.add(separator());

        configureOptionsPerCellPanel = new JPanel();
        configureChordOptionsPerCellButton = new JButton("New options per cell");
        configureChordOptionsPerCellButton.addActionListener(this::enterOptionsPerCellMode);
        configureOptionsPerCellPanel.add(configureChordOptionsPerCellButton);

        resetChordOptionsPerCellButton = new JButton("Reset options per cell");
        resetChordOptionsPerCellButton.addActionListener(this::resetOptionsPerCell);
        configureOptionsPerCellPanel.add(resetChordOptionsPerCellButton);

        initializedChordOptionsPerCellPanel = new JPanel();
        initializedChordOptionsPerCellPanel.add(new Label("Chord options per cell:"));
        initializedChordOptionsPerCellPanel.setLayout(new BoxLayout(initializedChordOptionsPerCellPanel, BoxLayout.Y_AXIS));

        mainContainer.add(configureOptionsPerCellPanel);
        mainContainer.add(initializedChordOptionsPerCellPanel);

        mainContainer.add(separator());

        optionsPerCellPositionField = new TextFieldWithTitle("Position");
        add(optionsPerCellPositionField);
        optionsPerCellValueField = new TextFieldWithTitle("Possible values");
        add(optionsPerCellValueField);
        addChordOptionsPerCellButton = new JButton("Add");
        addChordOptionsPerCellButton.addActionListener(this::addChordOptionsPerCell);
        add(addChordOptionsPerCellButton);


        addConstraintsPanel = new JPanel();
        addConstraintsPanel.setLayout(new BoxLayout(addConstraintsPanel, BoxLayout.Y_AXIS));
        mainContainer.add(addConstraintsPanel);

        mainContainer.add(separator());

        operationsPanel = new JPanel();
        mainContainer.add(operationsPanel);

        mainContainer.add(separator());

        initializedConstraintsPanel = new JPanel();
        initializedConstraintsPanel.setLayout(new BoxLayout(initializedConstraintsPanel, BoxLayout.Y_AXIS));
        mainContainer.add(initializedConstraintsPanel);

        initializedConstraintsPanel.add(new Label("Initialized constraints:"));

        keyTextField = new TextFieldWithTitle("Global key");
        keyTextField.setText("C");
        globalParametersPanel.add(keyTextField, globalParametersPanelGbc);
        globalParametersPanelGbc.gridy++;

        numChordsTextField = new TextFieldWithTitle("Number of chords to generate");
        numChordsTextField.setText(String.valueOf(8));
        globalParametersPanel.add(numChordsTextField, globalParametersPanelGbc);
        globalParametersPanelGbc.gridy++;

        notesPerChordTextField = new TextFieldWithTitle("Number of notes per chord");
        notesPerChordTextField.setText(String.valueOf(4));
        globalParametersPanel.add(notesPerChordTextField, globalParametersPanelGbc);
        globalParametersPanelGbc.gridy++;

        addNoteConstraintPanel = new JPanel();
        addConstraintsPanel.add(addNoteConstraintPanel);

        noteConstraintComboBox = new JComboBox<>(allNoteConstraints.stream().toArray(String[]::new));
        noteConstraintComboBox.setPreferredSize(new Dimension(300, 25));
        addNoteConstraintPanel.add(noteConstraintComboBox);

        configureNoteConstraintButton = new JButton("+");
        configureNoteConstraintButton.addActionListener(this::configureNoteConstraint);
        addNoteConstraintPanel.add(configureNoteConstraintButton);

        addChordConstraintPanel = new JPanel();
        addConstraintsPanel.add(addChordConstraintPanel);

        chordConstraintComboBox = new JComboBox<>(allChordConstraints.stream().toArray(String[]::new));
        chordConstraintComboBox.setPreferredSize(new Dimension(300, 25));
        addChordConstraintPanel.add(chordConstraintComboBox);

        configureChordConstraintButton = new JButton("+");
        configureChordConstraintButton.addActionListener(this::configureChordConstraint);
        addChordConstraintPanel.add(configureChordConstraintButton);

        weightTextField = new TextFieldWithTitle("Soft constraint weight");
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
        operationsPanel.add(generateButton);

        playButton = new JButton("Play last result");
        playButton.addActionListener(this::play);
        operationsPanel.add(playButton);

        resetButton = new JButton("Reset");
        resetButton.addActionListener(this::resetConstraints);
        operationsPanel.add(resetButton);

        constraintsLabel = new JLabel("\n");
        add(constraintsLabel);

        enterMainMode();
        setVisible(true);
    }

    private void addChordOptionsPerCell(ActionEvent actionEvent) {
        int position = Integer.parseInt(optionsPerCellPositionField.getText());
        if(usedChordOptionPositions.contains(position)){
            throw new RuntimeException("There are already options defined for this position");
        }
        usedChordOptionPositions.add(position);
        Set<Chordesque> options = Chord.parseSet(optionsPerCellValueField.getText())
                .stream()
                .map(x -> (Chordesque) x)
                .collect(Collectors.toSet());

        chordOptionsPerCell.setOptions(position, options);
        initializedChordOptionsPerCellPanel.add(panelFromOptions(position, options));

        enterMainMode();
    }

    private JPanel panelFromOptions(int pos, Set<?> options){
        JPanel out = new JPanel();
        out.setMaximumSize(new Dimension(Integer.MAX_VALUE, 50));
        out.setLayout(new BorderLayout());
        out.setBorder(new LineBorder(Color.black));

        JLabel label = new JLabel("Position: " + pos + ", Options: " + options.toString());
        Font nameFont = new Font("Courier", Font.BOLD, 12);
        label.setFont(nameFont);
        out.add(label);

        return out;
    }

    private void resetOptionsPerCell(ActionEvent actionEvent) {
        chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        usedChordOptionPositions = new HashSet<>();
        chordOptionsPerCell.reset();
        chordCanvasAttributes.setOptions(chordOptionsPerCell);

        initializedChordOptionsPerCellPanel.removeAll();
        initializedChordOptionsPerCellPanel.add(new Label("Chord options per cell:"));
        initializedChordOptionsPerCellPanel.revalidate();
        initializedChordOptionsPerCellPanel.repaint();
    }

    public static Component separator(){
        return separator(20);
    }

    private static Component separator(int space) {
        // Create an empty JPanel with a fixed height
        JPanel emptyPanel = new JPanel();
        emptyPanel.setOpaque(false);
        emptyPanel.setPreferredSize(new Dimension(0, space));
        emptyPanel.setMinimumSize(new Dimension(0, space));
        emptyPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, space));

        return emptyPanel;
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
                mainContainer
        );
        for(JComponent component : componentsToHide){
            component.setVisible(false);
        }
    }

    private void enterOptionsPerCellMode(ActionEvent e){
        mainContainer.setVisible(false);
        Set<JComponent> componentsToShow = Set.of(
                optionsPerCellPositionField,
                optionsPerCellValueField,
                addChordOptionsPerCellButton
        );
        for (JComponent component : componentsToShow){
            component.setVisible(true);
        }
    }

    private void enterMainMode(){
        Set<JComponent> componentsToHide = Set.of(
                addNoteConstraintButton,
                addChordConstraintButton,
                integerSetTextField,
                melodyShapeTextField,
                weightTextField,
                noteGrabberComboBox,
                optionsPerCellPositionField,
                optionsPerCellValueField,
                addChordOptionsPerCellButton
        );
        for(JComponent component : componentsToHide){
            component.setVisible(false);
        }
        mainContainer.setVisible(true);
    }

    public void configureNoteConstraint(ActionEvent e) {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();
        configureNoteConstraint(selectedOption);
    }

    private void configureNoteConstraint(String selectedOption) {
        if(usedConstraintTypes.contains(selectedOption)){
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

    private void removeConstraint(String name){
        noteConstraints.removeConstraint(name);
        chordConstraints.removeConstraint(name);
        usedConstraintTypes.remove(name);
        removeConstraintFromVisualList(name);
    }

    private void removeConstraintFromVisualList(String name) {
        ConstraintPanel toRemove = null;
        for (Component component : initializedConstraintsPanel.getComponents()){
            if(component instanceof ConstraintPanel){
                ConstraintPanel panel = (ConstraintPanel) component;
                if(panel.getName().equals(name)) toRemove = panel;
            }
        }
        initializedConstraintsPanel.remove(toRemove);
        initializedConstraintsPanel.revalidate();
        initializedConstraintsPanel.repaint();
    }

    private void addNoteConstraint() {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();

        addNoteConstraint(selectedOption);
    }

    private void addNoteConstraint(String selectedOption) {
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
        usedConstraintTypes.add(selectedOption);
        addConstraintToVisualList(newConstraint);
        enterMainMode();
    }

    private void addConstraintToVisualList(Constraint constraint) {
        //constraintsLabel.setText(multiline(constraintsLabel.getText() + selectedOption + "\n"));
        initializedConstraintsPanel.add(panelFromConstraint(constraint));
    }

    public void configureChordConstraint(ActionEvent e) {
        String selectedOption = (String) chordConstraintComboBox.getSelectedItem();
        configureChordConstraint(selectedOption);
    }

    private void configureChordConstraint(String selectedOption) {
        if(usedConstraintTypes.contains(selectedOption)){
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
        addChordConstraint(selectedOption);
    }

    private void addChordConstraint(String selectedOption) {
        Constraint<Chordesque> newConstraint;
        switch (selectedOption) {
            case CHORDS_IN_KEY -> {newConstraint = new ChordInKeyConstraint(new BasicKeyGrabber());}
            case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {newConstraint = createChordStepSizeConstraint();}
            case PERFECT_CADENCES -> {newConstraint = createPerfectCadenceSoftConstraint();}
            case PLAGAL_CADENCES -> {newConstraint = createPlagalCadenceSoftConstraint();}
            default -> throw new RuntimeException("Unknown option");
        }
        chordConstraints.addConstraint(newConstraint);
        usedConstraintTypes.add(selectedOption);
        addConstraintToVisualList(newConstraint);
        enterMainMode();
    }

    public void generate(ActionEvent e) {
        updateHigherValues();
        updateCanvasAttributes();
        chordLevelNode = new ChordLevelNode(null, higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());
        List<ChordResult> result = chordLevelNode.generate();
        System.out.println(result);
        lastResult = result;
    }

    private void updateCanvasAttributes() {
        chordCanvasAttributes.setSize(Integer.parseInt(numChordsTextField.getText()));
        noteCanvasAttributes.setSize(Integer.parseInt(notesPerChordTextField.getText()));
    }

    private void updateHigherValues() {
        higherValues = higherValues.copyWithKey(parseKey());
    }

    private Key parseKey() {
        String input = keyTextField.getText();
        return new MajorKey(Note.valueOf(input.replace('#', 'S').toUpperCase(Locale.ROOT)));
    }

    private void play(ActionEvent actionEvent) {
        if(lastResult == null){
            alert("Nothing has been generated yet");
            return;
        }
        try {
            sequencer.setSequence(getSequence(lastResult));
            midiPlayer.start();
        } catch (InvalidMidiDataException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void resetConstraints(ActionEvent e) {
        alert("Constraints cleared");
        noteConstraints.reset();
        chordConstraints.reset();

        constraintsLabel.setText("\n");
        initializedConstraintsPanel.removeAll();
        initializedConstraintsPanel.add(new Label("Initialized constraints:"));
        initializedConstraintsPanel.revalidate();
        initializedConstraintsPanel.repaint();

        usedConstraintTypes = new HashSet<>();
    }

    public static void main(String[] args) {
        new MyApp();
    }

    public static String multiline(String s)
    {
        return "<html>" + s.replaceAll("\n", "<br>");
    }

    public ConstraintPanel panelFromConstraint(Constraint constraint){
        String name = constraint.name();
        ConstraintPanel out = new ConstraintPanel(name);
        out.setMaximumSize(new Dimension(Integer.MAX_VALUE, 50));
        out.setLayout(new BorderLayout());
        out.setBorder(new LineBorder(Color.black));

        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(new BoxLayout(infoPanel, BoxLayout.Y_AXIS));
        out.add(infoPanel, BorderLayout.WEST);

        JLabel nameLabel = new JLabel(name);
        Font nameFont = new Font("Courier", Font.BOLD, 12);
        nameLabel.setFont(nameFont);
        infoPanel.add(nameLabel);

        JLabel configLabel = new JLabel(constraint.configText());
        infoPanel.add(configLabel);

        JPanel buttonPanel = new JPanel();
        out.add(buttonPanel, BorderLayout.EAST);

        JButton reconfigureButton = new JButton("Reconfigure");
        reconfigureButton.addActionListener((e) -> {
            removeConstraint(name);
            if(allNoteConstraints.contains(name)) configureNoteConstraint(name);
            else if (allChordConstraints.contains(name)) configureChordConstraint(name);
        });
        buttonPanel.add(reconfigureButton);

        JButton deleteButton = new JButton("Delete");
        deleteButton.addActionListener((e) -> removeConstraint(name));
        buttonPanel.add(deleteButton);

        return out;
    }
}
