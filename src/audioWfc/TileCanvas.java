package audioWfc;

import audioWfc.constraints.ConstraintSet;

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

    public TileCanvas(Set<T> allOptions, ConstraintSet<T> constraints, List<Optional<T>> input, Random random){
        int n = input.size();
        if(n < 1) throw new IllegalArgumentException();
        this.allOptions = allOptions;
        this.constraints = constraints;
        this.size = n;
        this.collapsed = 0;
        this.tiles = new ArrayList<>();

        if(input.get(0).isEmpty()){
            this.tiles.add(new Tile<>(this, 0));
        }else{
            this.tiles.add(new Tile<>(this, 0, input.get(0).get()));
            this.collapsed++;
        }

        for (int i = 1; i < n; i++) {
            Tile<T> tile;
            if(input.get(i).isEmpty()){
                tile = new Tile<>(this, i);
            } else {
                tile = new Tile<>(this, i, input.get(i).get());
                this.collapsed++;
            }
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

    public TileCanvas(Set<T> allOptions, ConstraintSet<T> constraints, int n, Random random){
        this(allOptions, constraints, Collections.nCopies(n, Optional.empty()), random);
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
