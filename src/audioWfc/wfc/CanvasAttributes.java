package audioWfc.wfc;

public class CanvasAttributes<T> {
    private ConstraintSet<T> constraints;
    private OptionsPerCell<T> options;
    private int size;

    public CanvasAttributes(ConstraintSet<T> constraints, OptionsPerCell<T> options, int size) {
        this.constraints = constraints;
        this.options = options;
        this.size = size;
    }

    public ConstraintSet<T> getConstraints() {
        return constraints;
    }

    public void setConstraints(ConstraintSet<T> constraints) {
        this.constraints = constraints;
    }

    public OptionsPerCell<T> getOptions() {
        return options;
    }

    public void setOptions(OptionsPerCell<T> options) {
        this.options = options;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
