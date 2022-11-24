**START 22/11 9:30**

Now: Uniform random choice from all allowed neighborhoods. 
We would like some set of weighted probabilities.
For instance: if on the layer above we got the value "increasing": give large weights to increasing neighbor-pairs
Each neighbor-pair could have a set of labels. A ruleset could act like the following: "For each neighbor-pair with the label 'increasing', multiply its weight by 5".
The labels could be a mapping from all possible labels to a factor. Then, the probability weight would get influenced by the product of the value inherited from the layer above and the factor given by the neighbor-pair. For 'non-applying' labels, this factor could just be 0. Basically, we could define a label-weight vector, which is an attribute of each rule and each neighbor-pair. The weighted probability could then just be the dot product of the two relevant vectors. We should figure out whether negative weights should be allowed. If we allow them, that can lead to more expressive behavior (i.e. one attribute makes the neighbor-pair more likely, but another counters it), but since negative probabilities/weights don't make sense, it would need to be clamped to 0, which means the relationship wouldn't be linear anymore. We need to experiment with this, and see how it "feels". We could also use some sort of activation function to map the reals to the positive reals in a meaningful way - the exponential function comes to mind. This would mean that no neighbor-pair will ever explicitly get the probability 0, which might be nice to avoid very "robotic" behavior - this is procedurally generated music after all. The clamping and the exponential solutions are very similar: they are both activation functions: if we decide to go with these and allow negative values in the weight vectors, the exact activation function could be a hyperparameter of the machine. We could either choose one for the entire process (all layers) or, more interestingly, we could choose these hyperparameters for a layer in the layer above.

For rules more complicated than 'increasing' and  'decreasing', we need to keep track of where we are inside the canvas (at least with respect to the current layer).
One way to do this would be the following: for each neighbor-pair, we can define the weight vector as a function of the location inside the canvas (most probably as a function of a number between 0 and 1, 0 being the first pair in the canvas, 1 (minus epsilon) being the last pair in the canvas). One problem with this can be that it seems difficult to automate. For each neighbor-pair and each label of that pair, we need to come up with not just a number, but a meaningful function. Beside choosing a function type (i.e. polynomial, exponential, rational, etc), we would also need to choose their parameters. We would need to make sure that for each function, we choose meaningful parameters that don't mess up the final probabilities too much, this seems like a very complex task.
Another possibility is, instead of using neighbor-pairs, we could look at multiple, further "neighbors" to get more context. This might also be problematic: for one, it would sort of go against the idea of WFC, the idea of looking at the immediate neighbours to build the output. *Is there consensus about whether it is "allowed" within the confines of WFC?* Another problem is the question of "starting out". If we only have a couple items far away from each other, then even for their immediate neighbours, the region that they look at to get an output would contain undetermined nodes. How to deal with that? We could maybe take an average of all the possibilities that the determined neighbors can be a part of. That also seems very complex (and computationally expensive).

Sort of unrelated to the whole hierarchical WFC topic: to avoid running into situations where we cannot fill the canvas, we can keep a stack of all the decisions that the machine has made. If we run into a contradiction, we look at the last decision on the stack, we make the weight of that decision 0 and generate it again. Storing all these states might be expensive, it might not be. It's worth a try.

**END 10:18**

---

**Post-meeting mind dump - START 24/11 13:41**

Let's not care about the position of the tile within the canvas for now - the constraints obtained from the hierarchy will take care of things being sort of in the right place.

Underlying chord for a section could be one of the levels - it directly and logically influences the note choices in lower levels.

Homework: map out a structure with at least three meaningful levels of hierarchy. One of them will probably be the chord thing. If the map is somewhat clear, start implementing it.

Lookup structure for notes within keys and for notes within chords. I would like to define a structure that, given a key, tells me how likely a given note-transition is. Same for a given chord.
If we use underlying chords, these will have their "preferences" for notes, but the key of the composition (or of the section) also has its own. How do we balance between these? Again, this could be a static ratio, or something defined by a higher level.
I would like to define this structure in as generic of a way as possible, so that constructing it would just be naming the given key or chord. I don't want to hardcode things for each root-note, so I will use music theory to make generic models.

Constraints are nice: maybe we should have a system where a decision above can completely rule out some possibilities on lower levels, instead of making them unlikely.

**END 13:57**