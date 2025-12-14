# Code City Viz

By Diego Pacheco

<img src="logo.png" width="400"/>

## Result

Using: https://github.com/google/gson

<img src="code-city-result-google-gson.png" width="800"/>

## How it works?

It clones a github project and analize size and number of commits on the file and the buid a 3D city where:
- Each building is a file
- The height of the building is the number of lines of code / commits
- People are entering and exiting buildings as code is being modified more often
- Clouds are for fun

## How to use it?

```
./run.sh https://github.com/google/gson
```

## Features

1. Visualization of the code base and 2 blocks: code and test
2. The bigger the building, more commits/size.
3. Search files and highlight the building.
4. Added scene with clouds, cars, people and trees.
5. Filter on day/night mode.
6. Filter on show/hide code/test, bugs.
7. Free navigation on the city using the mouse and zoon in/out.
8. Select other cities(local files: org_repo.json) pre-analyzed.
9. Double click on the building to open the file on github.
10. FPS display on the right botton corner.