class Room {

    constructor(polygon) {

        this.id = "";
        this.name = "";
        this.notes = "";
        this.tags = [];
        this.images = [];
        this.polygon = polygon;
        this.label = null;

    }

    toObject() {

        const points = [];

        const svgPoints = this.polygon.points;

        for (let i = 0; i < svgPoints.length; i++) {

            points.push([
                svgPoints[i].x,
                svgPoints[i].y
            ]);

        }

        return {

            id: this.id,

            name: this.name,

            notes: this.notes,

            tags: this.tags,

            images: this.images,

            polygon: points

        };

    }

}