package audioWfc.gui;

import audioWfc.AudioWFCApp;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
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
import audioWfc.wfc.constraints.concepts.IntegerSetConstraint;
import audioWfc.wfc.constraints.concepts.MelodyShape;
import audioWfc.wfc.constraints.concepts.SoftConstraint;
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
import static audioWfc.wfc.constraints.ConstraintUtils.*;

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
import javax.swing.*;
import javax.swing.border.LineBorder;

import static audioWfc.audio.SequencerBuilder.getSequence;

public class MyApp extends JFrame {
    private JComboBox<String> noteConstraintComboBox;
    private JComboBox<String> chordConstraintComboBox;
    private JComboBox<String> noteGrabberComboBox;
    private JButton addNoteConstraintButton;
    private JButton addChordConstraintButton;
    private JButton submitConfigNoteConstraintButton;
    private JButton submitConfigChordConstraintButton;
    private JPanel initializedChordOptionsPerCellPanel;
    private TextFieldWithTitle optionsPerCellPositionField;
    private TextFieldWithTitle optionsPerCellValueField;
    private JButton addChordOptionsPerCellButton;
    private JPanel mainContainer;
    private JPanel initializedNoteConstraintsPanel;
    private JPanel initializedChordConstraintsPanel;
    private JLabel constraintsLabel;
    private TextFieldWithTitle keyTextField;
    private TextFieldWithTitle numChordsTextField;
    private TextFieldWithTitle notesPerChordTextField;
    private TextFieldWithTitle weightTextField;
    private TextFieldWithTitle integerSetTextField;
    private TextFieldWithTitle melodyShapeTextField;

    private AudioWFCApp app;

    public MyApp() {
        app = new AudioWFCApp();
        setupGUI();
    }

    private void setupGUI() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setTitle("My GUI");
        setSize(1000, 800);
        setLayout(new FlowLayout());

        mainContainer = new JPanel();
        mainContainer.setLayout(new BoxLayout(mainContainer, BoxLayout.Y_AXIS));
        add(mainContainer);

        JPanel optionsPanel = new JPanel();
        optionsPanel.setLayout(new BoxLayout(optionsPanel, BoxLayout.X_AXIS));

        JPanel globalParametersPanel = new JPanel();
        GridBagConstraints globalParametersPanelGbc = new GridBagConstraints();
        globalParametersPanelGbc.anchor = GridBagConstraints.WEST;
        globalParametersPanelGbc.gridx = 0;
        globalParametersPanelGbc.gridy = 0;
        globalParametersPanel.setLayout(new GridBagLayout());
        optionsPanel.add(globalParametersPanel);

        JPanel optionsPerCellPanel = new JPanel();
        optionsPerCellPanel.setLayout(new BoxLayout(optionsPerCellPanel, BoxLayout.Y_AXIS));

        JPanel configureOptionsPerCellPanel = new JPanel();
        JButton configureChordOptionsPerCellButton = new JButton("New options per cell");
        configureChordOptionsPerCellButton.addActionListener(this::enterOptionsPerCellMode);
        configureOptionsPerCellPanel.add(configureChordOptionsPerCellButton);

        JButton resetChordOptionsPerCellButton = new JButton("Reset options per cell");
        resetChordOptionsPerCellButton.addActionListener(this::resetOptionsPerCell);
        configureOptionsPerCellPanel.add(resetChordOptionsPerCellButton);

        initializedChordOptionsPerCellPanel = new JPanel();
        initializedChordOptionsPerCellPanel.add(new Label("Chord options per cell:"));
        initializedChordOptionsPerCellPanel.setLayout(new BoxLayout(initializedChordOptionsPerCellPanel, BoxLayout.Y_AXIS));

        optionsPerCellPanel.add(configureOptionsPerCellPanel);
        optionsPerCellPanel.add(initializedChordOptionsPerCellPanel);
        optionsPanel.add(optionsPerCellPanel);

        mainContainer.add(optionsPanel);

        mainContainer.add(separator());

        optionsPerCellPositionField = new TextFieldWithTitle("Position");
        add(optionsPerCellPositionField);
        optionsPerCellValueField = new TextFieldWithTitle("Possible values");
        add(optionsPerCellValueField);
        addChordOptionsPerCellButton = new JButton("Add");
        addChordOptionsPerCellButton.addActionListener(this::addChordOptionsPerCell);
        add(addChordOptionsPerCellButton);

        JPanel constraintsPanel = new JPanel();
        constraintsPanel.setLayout(new BoxLayout(constraintsPanel, BoxLayout.X_AXIS));

        JPanel noteConstraintsPanel = new JPanel();
        noteConstraintsPanel.setLayout(new BoxLayout(noteConstraintsPanel, BoxLayout.Y_AXIS));

        JPanel chordConstraintsPanel = new JPanel();
        chordConstraintsPanel.setLayout(new BoxLayout(chordConstraintsPanel, BoxLayout.Y_AXIS));

        noteConstraintsPanel.add(new JLabel("Add melody constraint:"));
        chordConstraintsPanel.add(new JLabel("Add chord constraint:"));

        JPanel addNoteConstraintPanel = new JPanel();
        noteConstraintsPanel.add(addNoteConstraintPanel);

        noteConstraintComboBox = new JComboBox<>(allNoteConstraints.stream().toArray(String[]::new));
        noteConstraintComboBox.setPreferredSize(new Dimension(300, 25));
        addNoteConstraintPanel.add(noteConstraintComboBox);

        JButton configureNoteConstraintButton = new JButton("+");
        configureNoteConstraintButton.addActionListener(this::configureNewNoteConstraint);
        addNoteConstraintPanel.add(configureNoteConstraintButton);

        JPanel addChordConstraintPanel = new JPanel();
        chordConstraintsPanel.add(addChordConstraintPanel);

        chordConstraintComboBox = new JComboBox<>(allChordConstraints.stream().toArray(String[]::new));
        chordConstraintComboBox.setPreferredSize(new Dimension(300, 25));
        addChordConstraintPanel.add(chordConstraintComboBox);

        JButton configureChordConstraintButton = new JButton("+");
        configureChordConstraintButton.addActionListener(this::configureNewChordConstraint);
        addChordConstraintPanel.add(configureChordConstraintButton);

        JButton resetNoteConstraintsButton = new JButton("Reset melody constraints");
        resetNoteConstraintsButton.addActionListener(this::resetNoteConstraints);
        noteConstraintsPanel.add(resetNoteConstraintsButton);

        JButton resetChordConstraintsButton = new JButton("Reset chord constraints");
        resetChordConstraintsButton.addActionListener(this::resetChordConstraints);
        chordConstraintsPanel.add(resetChordConstraintsButton);

        initializedNoteConstraintsPanel = new JPanel();
        initializedNoteConstraintsPanel.setLayout(new BoxLayout(initializedNoteConstraintsPanel, BoxLayout.Y_AXIS));
        initializedNoteConstraintsPanel.add(new Label("Initialized melody constraints:"));
        noteConstraintsPanel.add(initializedNoteConstraintsPanel);

        initializedChordConstraintsPanel = new JPanel();
        initializedChordConstraintsPanel.setLayout(new BoxLayout(initializedChordConstraintsPanel, BoxLayout.Y_AXIS));
        initializedChordConstraintsPanel.add(new Label("Initialized chord constraints:"));
        chordConstraintsPanel.add(initializedChordConstraintsPanel);

        constraintsPanel.add(noteConstraintsPanel);
        constraintsPanel.add(Box.createRigidArea(new Dimension(100,100)));
        constraintsPanel.add(chordConstraintsPanel);

        mainContainer.add(constraintsPanel);

        mainContainer.add(separator());

        JPanel operationsPanel = new JPanel();
        mainContainer.add(operationsPanel);

        mainContainer.add(separator());

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

        submitConfigNoteConstraintButton = new JButton("Save configuration");
        add(submitConfigNoteConstraintButton);

        submitConfigChordConstraintButton = new JButton("Save configuration");
        add(submitConfigChordConstraintButton);


        JButton generateButton = new JButton("Generate");
        generateButton.addActionListener(this::generate);
        operationsPanel.add(generateButton);

        JButton playButton = new JButton("Play last result");
        playButton.addActionListener(this::play);
        operationsPanel.add(playButton);

        constraintsLabel = new JLabel("\n");
        add(constraintsLabel);

        enterMainMode();
        setVisible(true);
    }

    private void addChordOptionsPerCell(ActionEvent actionEvent) {
        int position = Integer.parseInt(optionsPerCellPositionField.getText());
        if(app.chordOptionPositionReserved(position)){
            throw new RuntimeException("There are already options defined for this position");
        }
        app.reserveChordOptionPosition(position);
        Set<Chordesque> options = Chord.parseSet(optionsPerCellValueField.getText())
                .stream()
                .map(x -> (Chordesque) x)
                .collect(Collectors.toSet());

        app.setChordOption(position, options);
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
        app.resetOptionsPerCell();

        initializedChordOptionsPerCellPanel.removeAll();
        initializedChordOptionsPerCellPanel.add(new Label("Chord options per cell:"));
        initializedChordOptionsPerCellPanel.revalidate();
        initializedChordOptionsPerCellPanel.repaint();
    }

    public static Component separator(){
        return separator(50);
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
                submitConfigNoteConstraintButton,
                submitConfigChordConstraintButton,
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

    public void configureNewNoteConstraint(ActionEvent e) {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();
        configureNoteConstraint((Constraint<OctavedNote>) constraintFromName(selectedOption));
    }

    private void submitConfigNoteConstraint(Constraint<OctavedNote> constraint){
        remove(submitConfigNoteConstraintButton);
        submitConfigNoteConstraintButton = new JButton("Save configuration");
        add(submitConfigNoteConstraintButton);
        addNoteConstraint(constraint.name());
    }

    private void configureNoteConstraint(Constraint<OctavedNote> constraint) {
        if(app.constraintTypeReserved(constraint.name())){
            alert("Constraint already exists");
        } else {
            enterConfigMode();
            Set<JComponent> componentsToShow = new HashSet<>();
            switch (constraint.name()) {
                case MELODY_STEP_SIZES, MELODY_IN_OCTAVES -> {
                    String integerSetString = ((IntegerSetConstraint) constraint).integerSetString(app.getHigherValues());
                    integerSetTextField.setText(integerSetString);
                    componentsToShow.add(integerSetTextField);
                }
                case ASCENDING_MELODY, DESCENDING_MELODY -> {
                    String weightString = ((SoftConstraint<?>) constraint).weightString();
                    weightTextField.setText(weightString);
                    componentsToShow.add(weightTextField);
                }
                case START_MELODY_ON_NOTE -> {
                    String selectedNoteString = ((MelodyStartsOnNoteHardConstraint) constraint).configText();
                    noteGrabberComboBox.setSelectedItem(selectedNoteString);
                    componentsToShow.add(noteGrabberComboBox);
                }
                case MELODY_SHAPE -> {
                    String melodyShapeString = ((MelodyShapeHardConstraint) constraint).melodyShapeString(app.getHigherValues());
                    melodyShapeTextField.setText(melodyShapeString);
                    componentsToShow.add(melodyShapeTextField);
                }
            }
            if(componentsToShow.isEmpty()){
                addNoteConstraint();
                return;
            } else {
                submitConfigNoteConstraintButton.addActionListener((e) -> submitConfigNoteConstraint(constraint));
            }
            componentsToShow.add(submitConfigNoteConstraintButton);
            for(JComponent component : componentsToShow){
                component.setVisible(true);
            }
        }
    }

    public void addNoteConstraint(ActionEvent e) {
        addNoteConstraint();
    }

    private void removeConstraint(Constraint constraint){
        app.removeConstraint(constraint);
        removeConstraintFromVisualList(constraint.name());
    }

    private void removeConstraintFromVisualList(String name) {
        if(allNoteConstraints.contains(name)) removeConstraintFromVisualList(name, initializedNoteConstraintsPanel);
        else if (allChordConstraints.contains(name)) removeConstraintFromVisualList(name, initializedChordConstraintsPanel);
        else alert("Remove unsuccessful: no such constraint");
    }

    private void removeConstraintFromVisualList(String name, JPanel container) {
        ConstraintPanel toRemove = null;
        for (Component component : container.getComponents()){
            if(component instanceof ConstraintPanel){
                ConstraintPanel panel = (ConstraintPanel) component;
                if(panel.getName().equals(name)) toRemove = panel;
            }
        }
        container.remove(toRemove);
        container.revalidate();
        container.repaint();
    }

    private void addNoteConstraint() {
        String selectedOption = (String) noteConstraintComboBox.getSelectedItem();

        addNoteConstraint(selectedOption);
    }

    private void addNoteConstraint(String selectedOption) {
        try {
            Constraint<OctavedNote> newConstraint;
            switch (selectedOption) {
                case MELODY_IN_KEY -> {
                    newConstraint = new NoteInKeyHardConstraint(new BasicKeyGrabber());
                }
                case MELODY_STEP_SIZES -> {
                    newConstraint = createMelodyStepSizeHardConstraint();
                }
                case ASCENDING_MELODY -> {
                    newConstraint = createAscendingMelodySoftConstraint();
                }
                case DESCENDING_MELODY -> {
                    newConstraint = createDescendingMelodySoftConstraint();
                }
                case START_MELODY_ON_NOTE -> {
                    newConstraint = new MelodyStartsOnNoteHardConstraint(createNoteGrabber());
                }
                case MELODY_IN_OCTAVES -> {
                    newConstraint = createNoteInOctavesConstraint();
                }
                case MELODY_SHAPE -> {
                    newConstraint = createMelodyShapeHardConstraint();
                }
                default -> throw new RuntimeException("Unknown option");
            }
            app.addNoteConstraint(newConstraint);
            app.reserveConstraintType(selectedOption);
            addConstraintToVisualList(newConstraint);
            enterMainMode();
        } catch (Exception e){
            e.printStackTrace();
        }
    }

    private void addConstraintToVisualList(Constraint constraint) {
        if(allNoteConstraints.contains(constraint.name())) initializedNoteConstraintsPanel.add(panelFromConstraint(constraint));
        else if(allChordConstraints.contains(constraint.name())) initializedChordConstraintsPanel.add(panelFromConstraint(constraint));
        else alert("Adding unsuccessful: invalid constraint");
    }

    public void configureNewChordConstraint(ActionEvent e) {
        String selectedOption = (String) chordConstraintComboBox.getSelectedItem();
        configureChordConstraint((Constraint<Chord>) constraintFromName(selectedOption));
    }

    private void submitConfigChordConstraint(Constraint<Chord> constraint){
        remove(submitConfigChordConstraintButton);
        submitConfigChordConstraintButton = new JButton("Save configuration");
        add(submitConfigChordConstraintButton);
        addChordConstraint(constraint.name());
    }

    private void configureChordConstraint(Constraint<Chord> constraint) {
        if(app.constraintTypeReserved(constraint.name())){
            alert("Constraint already exists");
        } else {
            enterConfigMode();
            Set<JComponent> componentsToShow = new HashSet<>();
            switch (constraint.name()) {
                case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {
                    String integerSetString = ((IntegerSetConstraint) constraint).integerSetString(app.getHigherValues());
                    integerSetTextField.setText(integerSetString);
                    componentsToShow.add(integerSetTextField);
                }
                case PERFECT_CADENCES, PLAGAL_CADENCES -> {
                    String weightString = ((SoftConstraint<Chord>) constraint).weightString();
                    weightTextField.setText(weightString);
                    componentsToShow.add(weightTextField);
                }
            }
            if(componentsToShow.isEmpty()){
                addChordConstraint();
                return;
            } else {
                submitConfigChordConstraintButton.addActionListener((e) -> submitConfigChordConstraint(constraint));
            }
            componentsToShow.add(submitConfigChordConstraintButton);
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
        try {
            Constraint<Chordesque> newConstraint;
            switch (selectedOption) {
                case CHORDS_IN_KEY -> {
                    newConstraint = new ChordInKeyConstraint(new BasicKeyGrabber());
                }
                case DISTANCES_BETWEEN_ADJACENT_CHORDS -> {
                    newConstraint = createChordStepSizeConstraint();
                }
                case PERFECT_CADENCES -> {
                    newConstraint = createPerfectCadenceSoftConstraint();
                }
                case PLAGAL_CADENCES -> {
                    newConstraint = createPlagalCadenceSoftConstraint();
                }
                default -> throw new RuntimeException("Unknown option");
            }
            app.addChordConstraint(newConstraint);
            app.reserveConstraintType(selectedOption);
            addConstraintToVisualList(newConstraint);
            enterMainMode();
        } catch (Exception e){
            e.printStackTrace();
        }
    }

    public void generate(ActionEvent e) {
        app.generate(parseKey(), Integer.parseInt(numChordsTextField.getText()), Integer.parseInt(notesPerChordTextField.getText()));
    }

    private void updateHigherValues() {

    }

    private Key parseKey() {
        String input = keyTextField.getText();
        return new MajorKey(Note.valueOf(input.replace('#', 'S').toUpperCase(Locale.ROOT)));
    }

    private void play(ActionEvent actionEvent) {
        try {
            app.play();
        } catch (Exception e) {
            alert(e.getMessage());
        }
    }

    public void resetNoteConstraints(ActionEvent e){
        resetConstraints(initializedNoteConstraintsPanel, "Initialized melody constraints:");
    }

    public void resetChordConstraints(ActionEvent e){
        resetConstraints(initializedChordConstraintsPanel, "Initialized chord constraints:");
    }

    public void resetConstraints(JPanel container, String labelText) {
        app.resetConstraints();

        constraintsLabel.setText("\n");
        container.removeAll();
        container.add(new Label(labelText));
        container.revalidate();
        container.repaint();

        alert("Constraints cleared");
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
            removeConstraint(constraint);
            if(allNoteConstraints.contains(name)) configureNoteConstraint(constraint);
            else if (allChordConstraints.contains(name)) configureChordConstraint(constraint);
        });
        buttonPanel.add(reconfigureButton);

        JButton deleteButton = new JButton("Delete");
        deleteButton.addActionListener((e) -> removeConstraint(constraint));
        buttonPanel.add(deleteButton);

        return out;
    }
}
