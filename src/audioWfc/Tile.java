package audioWfc;

import org.apache.commons.math3.distribution.EnumeratedDistribution;
import org.apache.commons.math3.util.Pair;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class Tile<T> {
    private Tile<T> prev;
    private Tile<T> next;
    private int position;
    private TileCanvas<T> canvas;
    private TileStatus status;
    private int numOptions;
    private T value;

    private List<Pair<T, Double>> optionWeights;

    public Tile(TileCanvas<T> canvas, int position, T value){
        this.canvas = canvas;
        this.position = position;
        this.status = TileStatus.COLLAPSED;
        this.value = value;
    }

    public Tile(TileCanvas<T> canvas, int position, Set<T> options){
        this.canvas = canvas;
        this.position = position;
        this.status = TileStatus.ACTIVE;
        this.optionWeights = options.stream().map(i -> new Pair<>(i, 1d)).collect(Collectors.toList());
    }

    public Tile(TileCanvas<T> canvas, int position){
        this(canvas, position, canvas.getAllOptions());
    }

    private Tile(){}

    public static Tile header(){
        Tile out = new Tile<>();
        out.status = TileStatus.HEADER;
        return out;
    }

    public static Tile trailer(){
        Tile out = new Tile<>();
        out.status = TileStatus.TRAILER;
        return out;
    }

    private Tile<T> hypotheticalTile(T value){
        Tile<T> out = new Tile(canvas, position, value);
        out.setPrev(prev);
        out.setNext(next);
        return out;
    }

    public int updateOptions(){
        if(status != TileStatus.ACTIVE) return -1;
        List<T> options = optionWeights.stream().map(Pair::getFirst).collect(Collectors.toList());
        return updateOptions(options);
    }

    private int updateOptions(Collection<T> options){
        List<Pair<T, Double>> newOptionWeights = new ArrayList<>();
        int out = 0;
        for(T option : options){
            double weight = canvas.getConstraints().weight(hypotheticalTile(option), canvas.getHigherValues());
            if(weight <= 0d) continue;
            Pair<T, Double> optionWeightPair = new Pair<>(option, weight);
            newOptionWeights.add(optionWeightPair);
            out++;
        }
        if(out == 0) throw new RuntimeException("No valid options left");

        this.optionWeights = newOptionWeights;
        this.numOptions = out;
        if(out == 1) {
            finishCollapse(optionWeights.get(0).getFirst());
            return 1;
        }
        canvas.update(this);
        return out;
    }

    public void collapse(){
        T value = new EnumeratedDistribution<>(optionWeights).sample();
        finishCollapse(value);
    }

    private void finishCollapse(T value) {
        this.status = TileStatus.COLLAPSED;
        this.value = value;
        next.updateOptions();
        prev.updateOptions();
        canvas.noteCollapse();
    }

    public Tile<T> getPrev() {
        return prev;
    }

    public Tile<T> getNext() {
        return next;
    }

    public void setPrev(Tile<T> prev) {
        this.prev = prev;
    }

    public void setNext(Tile<T> next) {
        this.next = next;
    }

    public int getNumOptions() {
        return numOptions;
    }

    public boolean isActive() {
        return status == TileStatus.ACTIVE;
    }

    public boolean isCollapsed() {
        return status == TileStatus.COLLAPSED;
    }

    public T getValue(){
        if(status != TileStatus.COLLAPSED) throw new RuntimeException("Tile isn't collapsed");
        return this.value;
    }

    public int getPosition(){
        return position;
    }
}
