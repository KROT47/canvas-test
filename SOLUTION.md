1. Since canvas does not have any elements we need to store their state manually, so working with canvas is kinda similar to working with React stateful components (CanvasItem). CanvasController is used to control items rendering behaviour while each item is handling position and sizes for content to be drawn in correct place. So we can draw anything easily by adding needed API to controller.
2. Since next drawn item will overlap previous one we can use array which index will represent z-index on canvas
3. Canvas width and height differ from bounding client rect ones, so we need to initialize them manually on each window resize. Also we need to update all items rects to maintain the same positions and sizes

#### TODO:

1. To add persistent state on refresh we need to add saving mechanism to CanvasController which should return list of items containing meta data and rect. By saving sequences of rects for each item we can add 'undo/redo' functionality
2. By updating item render method we will be able to add 'resize/crop' functionality
3. Also if items array becomes large enough to think about optimization we can iterate through items array backwards and calculate which items would not be seen and ignore rendering them. But it should be done only after user interaction ends.
