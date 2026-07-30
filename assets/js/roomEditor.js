class RoomEditor {

constructor(app) {

    this.app = app;
    this.points = [];
    this.tempLayer = null;
    this.pointLayer = null;
    this.lines = [];
    this.pointsSvg = [];
    this.previewLine = null;
    this.isDrawing = false;

}

initialise(svg) {

        this.svg = svg;

        // Create drawing layers if they don't already exist
        this.pointLayer = this.createLayer("pointLayer");
        this.tempLayer = this.createLayer("drawingLayer");

        svg.addEventListener("click", (e) => this.onClick(e));
        svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
        svg.addEventListener("dblclick", (e) => this.onDoubleClick(e));
}

createLayer(id) {

        let layer = this.svg.querySelector("#" + id);

        if (!layer) {

            layer = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );

            layer.id = id;

            this.svg.appendChild(layer);

        }

        return layer;

}

onClick(e) {

        if (this.app.currentTool !== "polygon")
            return;

        const p = getSVGPoint(e);

        if (this.points.length > 0) {

            const previous = this.points[this.points.length - 1];

            // Make the preview line permanent
            this.drawLine(previous, p);

            // Reset the preview line
            this.previewLine.remove();

            this.previewLine = null;

        }

        this.points.push(p);

        this.drawPoint(p);
        if (!this.previewLine) {

        this.previewLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        this.previewLine.setAttribute("x1", p.x);
        this.previewLine.setAttribute("y1", p.y);

        this.previewLine.setAttribute("x2", p.x);
        this.previewLine.setAttribute("y2", p.y);

        this.previewLine.setAttribute("stroke", "#C9A227");
        this.previewLine.setAttribute("stroke-width", "0.5");
        this.previewLine.setAttribute("stroke-dasharray", "1,1");

        this.tempLayer.appendChild(this.previewLine);

    }

        console.log(this.points);

}

onMouseMove(e) {

    if (!this.previewLine)
        return;

    if (this.points.length === 0)
        return;

    const p = getSVGPoint(e);

    const lastPoint = this.points[this.points.length - 1];

    this.previewLine.setAttribute("x1", lastPoint.x);
    this.previewLine.setAttribute("y1", lastPoint.y);

    this.previewLine.setAttribute("x2", p.x);
    this.previewLine.setAttribute("y2", p.y);

}

drawPoint(point) {

        const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);

        circle.setAttribute("r", 0.5);

        circle.setAttribute("fill", "#C9A227");

        this.pointLayer.appendChild(circle);
        this.pointsSvg.push(circle);

}
    
drawLine(start, end) {

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);

    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);

    line.setAttribute("stroke", "#C9A227");
    line.setAttribute("stroke-width", "0.5");

    this.tempLayer.appendChild(line);

    this.lines.push(line);

}

clearDrawing() {

    // Remove vertex circles
    this.pointsSvg.forEach(circle => circle.remove());

    // Remove permanent lines
    this.lines.forEach(line => line.remove());

    // Remove preview line
    if (this.previewLine) {

        this.previewLine.remove();

    }

    // Reset arrays
    this.points = [];
    this.pointsSvg = [];
    this.lines = [];

    this.previewLine = null;

    this.isDrawing = false;

}

onDoubleClick(e) {

    if (this.points.length < 3)
        return;

    const polygon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
    );

    const points = this.points
        .map(p => `${p.x},${p.y}`)
        .join(" ");

    polygon.setAttribute("points", points);

    polygon.setAttribute("fill", "#C9A227");
    polygon.setAttribute("fill-opacity", "0.25");

    polygon.setAttribute("stroke", "#c9a32700");
    polygon.setAttribute("stroke-width", "0.5");

    const room = new Room(polygon);

    this.createRoom(room);

    this.clearDrawing();

}

createRoom(room) {

    this.svg.appendChild(room.polygon);

    room.polygon.addEventListener("click", () => {

        if (this.app.currentTool === "delete") {

            this.deleteRoom(room);

            return;

        }

        this.selectRoom(room);

    });

    this.app.rooms.push(room);

}

selectRoom(room) {

    // Restore the previously selected room
    if (this.app.selectedRoom) {

        this.app.selectedRoom.polygon.setAttribute("stroke", "#c9a32700");
        this.app.selectedRoom.polygon.setAttribute("stroke-width", "0.5");

    }

    // Store the new selection
    this.app.selectedRoom = room;

    document.getElementById("roomId").value = room.id;

    document.getElementById("roomName").value = room.name;

    document.getElementById("roomNotes").value = room.notes;

    document.getElementById("roomTags").textContent =
        room.tags.length ? room.tags.join(", ") : "None";

    document.getElementById("roomImages").textContent =
        room.images.length + " image(s)";

    document.getElementById("roomId").disabled = false;
    document.getElementById("roomName").disabled = false;
    document.getElementById("roomNotes").disabled = false;

    // Highlight the new room
    room.polygon.setAttribute("stroke", "#C9A227");
    room.polygon.setAttribute("stroke-width", "0.6");

    console.log("Selected room:", room);

}

clearRooms() {

    console.log("Clearing", this.app.rooms.length, "rooms");

    this.app.rooms.forEach(room => {

        room.polygon.remove();

    });

    this.app.rooms = [];

    this.app.selectedRoom = null;

}

deleteRoom(room) {

    room.polygon.remove();

    this.app.rooms = this.app.rooms.filter(r => r !== room);

    if (this.app.selectedRoom === room) {

        this.app.selectedRoom = null;

    }

    document.getElementById("roomId").value = "";
    document.getElementById("roomName").value = "";
    document.getElementById("roomNotes").value = "";

    document.getElementById("roomId").disabled = true;
    document.getElementById("roomName").disabled = true;
    document.getElementById("roomNotes").disabled = true;

}

}