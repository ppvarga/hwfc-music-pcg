package audioWfc.wfc;

public record CanvasAttributes<T>(ConstraintSet<T> constraints,
                                  OptionsPerCell<T> options, int size) {
}
