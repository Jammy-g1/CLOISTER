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
    this.vertexHandles = [];
    this.dragHandle = null;
    this.dragRoom = null;

}

initialise(svg) {

        this.svg = svg;

        // Create drawing layers if they don't already exist
        this.pointLayer = this.createLayer("pointLayer");
        this.tempLayer = this.createLayer("drawingLayer");

        svg.addEventListener("click", (e) => this.onClick(e));
        svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
        svg.addEventListener("dblclick", (e) => this.onDoubleClick(e));
        window.addEventListener("mousemove", (e) => this.onVertexDrag(e));
        window.addEventListener("mouseup", () => this.stopVertexDrag());
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

    const last = this.points[this.points.length - 1];
    const previous = this.points[this.points.length - 2];

    if (
        last.x === previous.x &&
        last.y === previous.y
    ) {
        this.points.pop();
    }

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
    const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");

    label.setAttribute("font-size", "1.5");
    label.setAttribute("font-family", "Segoe UI");
    label.setAttribute("fill", "#000000");
    label.setAttribute("stroke", "none");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("pointer-events", "none");

    const box = room.polygon.getBBox();

    label.setAttribute("x", box.x + box.width / 2);
    label.setAttribute("y", box.y + box.height / 2);

    label.textContent = room.id;

    room.label = label;

    this.svg.appendChild(label);

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

//    document.getElementById("roomImages").textContent =
//        room.images.length + " image(s)";

    document.getElementById("roomId").disabled = false;
    document.getElementById("roomName").disabled = false;
    document.getElementById("roomNotes").disabled = false;

    // Highlight the new room
    console.log("Selecting:", room.id);
    console.log(room.polygon);
    console.log("Highlighting", room.id);
    room.polygon.setAttribute("stroke", "#C9A227");
    console.log(room.polygon.getAttribute("stroke"));
    room.polygon.setAttribute("stroke-width", "0.6");

    console.log("Selected room:", room);
    this.showVertices(room);
    refreshRoomImages(room);

}

showVertices(room) {

    this.vertexHandles.forEach(h => h.remove());

    this.vertexHandles = [];

    const points = room.polygon.points;

    for (let i = 0; i < points.length; i++) {

        const handle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        handle.setAttribute("cx", points[i].x);
        handle.setAttribute("cy", points[i].y);

        handle.setAttribute("r", "0.5");

        handle.setAttribute("fill", "#4FC3F7");
        handle.setAttribute("stroke", "none");

        this.svg.appendChild(handle);

        this.vertexHandles.push(handle);
      
        handle.addEventListener("mousedown", () => {

            this.dragHandle = i;
            this.dragRoom = room;

        });

    }

}

clearRooms() {

    console.log("Clearing", this.app.rooms.length, "rooms");

    this.app.rooms.forEach(room => {

        room.polygon.remove();

        if (room.label) {

            room.label.remove();

        }

    });

    this.app.rooms = [];

    this.app.selectedRoom = null;

}

deleteRoom(room) {

    room.polygon.remove();
    if (room.label) {

        room.label.remove();

    }

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

onVertexDrag(e) {

    if (this.dragHandle === null)
        return;

    const p = getSVGPoint(e);

    const points = this.dragRoom.polygon.points;

    points[this.dragHandle].x = p.x;
    points[this.dragHandle].y = p.y;

    this.vertexHandles[this.dragHandle].setAttribute("cx", p.x);
    this.vertexHandles[this.dragHandle].setAttribute("cy", p.y);
    this.updateLabel(this.dragRoom);

}

stopVertexDrag() {

    this.dragHandle = null;
    this.dragRoom = null;

}

updateLabel(room) {

    if (!room.label)
        return;

    const box = room.polygon.getBBox();

    room.label.setAttribute("x", box.x + box.width / 2);
    room.label.setAttribute("y", box.y + box.height / 2);

}


}