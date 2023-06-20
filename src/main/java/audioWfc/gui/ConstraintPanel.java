package audioWfc.gui;

import javax.swing.*;

public class ConstraintPanel extends JPanel {
    private final String name;

    public ConstraintPanel(String name){
        super();
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
