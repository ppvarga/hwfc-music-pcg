package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.hierarchy.prototypes.Section;

import java.util.Set;

public class SectionOnlyPrecededByConstraint implements HardConstraint<Section> {
    private Set<String> precedingSections;
    private String sectionName;

    public SectionOnlyPrecededByConstraint(Set<String> precedingSections) {
        this.precedingSections = precedingSections;
    }

    @Override
    public String name() {
        return "Section is followed by";
    }

    @Override
    public String configText() {
        return null;
    }

    @Override
    public boolean check(Tile<Section> tile, HigherValues higherValues) {
        Section section = tile.getValue();
        boolean out = true;

        Tile<Section> prevTile = tile.getPrev();
        if(prevTile.isCollapsed()){
            out &= check(prevTile.getValue(), section);
        }

        Tile<Section> nextTile = tile.getNext();
        if(prevTile.isCollapsed()){
            out &= check(section, nextTile.getValue());
        }

        return out;
    }

    private boolean check(Section a, Section b){
        if(!b.getName().equals(sectionName)) return true;
        return precedingSections.contains(a.getName());
    }
}
