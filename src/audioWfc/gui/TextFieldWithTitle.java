package audioWfc.gui;

import javax.swing.*;
import java.awt.*;

public class TextFieldWithTitle  extends JPanel {
    private JLabel label;
    private JTextField textField;

    public TextFieldWithTitle(String title) {
        label = new JLabel(title);
        textField = new JTextField(20);
        textField.setMaximumSize(
                new Dimension(Integer.MAX_VALUE, textField.getPreferredSize().height) );

        add(label);
        add(textField);

    }

    public String getText(){
        return textField.getText();
    }

    public void setText(String s){
        textField.setText(s);
    }
}
