class Application {

    constructor() {
        this.building = null;
        this.currentFloor = null;

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;

        this.currentTool = "pointer";

        this.zoom = 1;

        this.panX = 0;
        this.panY = 0;

        this.spacePressed = false;
        this.isPanning = false;

        this.startMouseX = 0;
        this.startMouseY = 0;

        this.svg = null;

        this.roomEditor = null;
    }

}