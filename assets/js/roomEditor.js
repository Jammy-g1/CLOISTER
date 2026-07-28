class RoomEditor {

constructor(app) {

    this.app = app;

    this.points = [];

    this.tempLayer = null;
    this.pointLayer = null;

    this.lines = [];

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

        this.previewLine.setAttribute("stroke", "#C9A227");
        this.previewLine.setAttribute("stroke-width", "2");
        this.previewLine.setAttribute("stroke-dasharray", "5,5");

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

        circle.setAttribute("r", 5);

        circle.setAttribute("fill", "#C9A227");

        this.pointLayer.appendChild(circle);

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
    line.setAttribute("stroke-width", "2");

    this.tempLayer.appendChild(line);

    this.lines.push(line);

    }

}