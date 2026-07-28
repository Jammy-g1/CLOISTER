class RoomEditor {

    constructor(app) {

        this.app = app;

        this.points = [];

        this.tempLayer = null;
        this.pointLayer = null;

    }

    initialise(svg) {

        this.svg = svg;

        // Create drawing layers if they don't already exist
        this.pointLayer = this.createLayer("pointLayer");
        this.tempLayer = this.createLayer("drawingLayer");

        svg.addEventListener("click", (e) => this.onClick(e));

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

        this.points.push(p);

        this.drawPoint(p);

        console.log(this.points);

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

}