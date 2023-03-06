package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.OptionsPerCell;

public record CanvasAttributes<T>(ConstraintSet<T> constraints,
                                  OptionsPerCell<T> options, int size) {
}
