package audioWfc;

import audioWfc.constraints.ConstraintSet;
import audioWfc.musicTheory.OptionsPerCell;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

public class TileCanvas<T> {
    private int size;
    private int collapsed;
    private List<Tile<T>> tiles;

    private Set<T> allOptions;
    private ConstraintSet<T> constraints;
    private TileSelector pq;
    private Random random;

    public TileCanvas(int n, OptionsPerCell<T> options, ConstraintSet<T> constraints, Random random){
        this.allOptions = options.getAllOptions();
        this.constraints = constraints;
        this.size = n;
        this.collapsed = 0;
        this.tiles = new ArrayList<>();

        this.tiles.add(new Tile<>(this, 0, options.get(0)));

        for (int i = 1; i < n; i++) {
            Tile<T> tile = new Tile<>(this, i, options.get(i));
            Tile<T> prev = this.tiles.get(i-1);
            tile.setPrev(prev);
            prev.setNext(tile);
            this.tiles.add(tile);
        }
        this.tiles.get(0).setPrev(Tile.header());
        this.tiles.get(n-1).setNext(Tile.trailer());

        this.pq = new TileSelector<>(random);
        this.random = random;

        for(Tile<T> tile : tiles) tile.updateOptions();
    }

    public TileCanvas(int n, Set<T> allOptions, ConstraintSet<T> constraints, Random random){
        this(n, new OptionsPerCell<>(allOptions), constraints, random);
    }

    public Tile<T> collapseNext(){
        if(collapsed >= size) throw new RuntimeException("Nothing to collapse");
        Tile<T> tileToCollapse = pq.poll();
        tileToCollapse.collapse();
        return tileToCollapse;
    }

    public List<T> generate(){
        while(collapsed < size) collapseNext();
        return tiles.stream().map(Tile::getValue).collect(Collectors.toList());
    }

    public int noteCollapse(){
        return ++this.collapsed;
    }

    public void update(Tile<T> tile){
        pq.add(tile);
    }

    public ConstraintSet<T> getConstraints() {
        return constraints;
    }

    public Set<T> getAllOptions() {
        return allOptions;
    }
}
