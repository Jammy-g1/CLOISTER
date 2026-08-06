const app = new Application();
app.roomEditor = new RoomEditor(app);

const floorSelector = document.getElementById("floorSelector");
const svgContainer = document.getElementById("svgContainer");
const buildingTree = document.getElementById("buildingTree");
const status = document.getElementById("status");
const viewport = document.getElementById("viewportWrapper");
const mapContainer = document.getElementById("mapContainer");
const roomIdInput = document.getElementById("roomId");
const roomNameInput = document.getElementById("roomName");
const roomNotesInput = document.getElementById("roomNotes");
const building = new Building("stbenedicts");
const search = document.getElementById("search");
const roomImageInput = document.getElementById("roomImage");
const roomImagePreview = document.getElementById("roomImagePreview");

async function start() {

    status.textContent = "Loading building...";

    await building.load();

    createExplorer();

    populateFloorSelector();

    await loadFloor(building.data.floors[0].id);

    status.textContent = "Ready";

}

function createExplorer() {

    buildingTree.innerHTML = "";

    const title = document.createElement("h4");
    title.textContent = "🏫 " + building.data.name;

    buildingTree.appendChild(title);

    building.data.floors.forEach(floor => {

        const div = document.createElement("div");

        div.className = "floorItem";

        div.textContent = "📁 " + floor.name;

        div.onclick = () => {

            floorSelector.value = floor.id;

            loadFloor(floor.id);

        };

        buildingTree.appendChild(div);

    });

}

function populateFloorSelector() {

    floorSelector.innerHTML = "";

    building.data.floors.forEach(floor => {

        const option = document.createElement("option");

        option.value = floor.id;
        option.textContent = floor.name;

        floorSelector.appendChild(option);

    });

    floorSelector.onchange = () => {

        loadFloor(floorSelector.value);

    };

}

function getSVGPoint(event) {

    const pt = app.svg.createSVGPoint();

    pt.x = event.clientX;
    pt.y = event.clientY;

    const result = pt.matrixTransform(
        app.svg.getScreenCTM().inverse()
    );

    return result;

}

async function loadFloor(id) {

    const floor = building.getFloor(id);

    status.textContent = "Loading " + floor.name;

    const response = await fetch(
        `buildings/${building.folder}/${floor.svg}`
    );

    const svg = await response.text();

    svgContainer.innerHTML = svg;

    const loadedSvg = svgContainer.querySelector("svg");

    app.svg = loadedSvg;
    app.roomEditor.initialise(loadedSvg);
    await loadRooms();

    loadedSvg.style.width = "100%";
    loadedSvg.style.height = "auto";

    status.textContent = floor.name;

}

function updateViewport() {

    mapContainer.style.transformOrigin = "0 0";

    mapContainer.style.transform =
        `translate(${app.panX}px, ${app.panY}px) scale(${app.zoom})`;

}

viewport.addEventListener("wheel", e=>{

    e.preventDefault();

    if(e.deltaY < 0){

        app.zoom *= 1.1;

    }else{

        app.zoom /= 1.1;

    }

    app.zoom = Math.min(50, Math.max(1, app.zoom));

    updateViewport();

});

window.addEventListener("keydown",e=>{

    if(e.code==="Space"){

        app.spacePressed=true;

        mapContainer.style.cursor="grab";

        e.preventDefault();

    }

});

window.addEventListener("keyup",e=>{

    if(e.code==="Space"){

        app.spacePressed=false;

        app.isPanning=false;

        mapContainer.style.cursor="default";

    }

});

viewport.addEventListener("mousedown",e=>{

    if(!app.spacePressed) return;

    app.isPanning=true;

    app.startMouseX=e.clientX-app.panX;
    app.startMouseY=e.clientY-app.panY;

    mapContainer.style.cursor="grabbing";

});

window.addEventListener("mousemove",e=>{

    if(!app.isPanning) return;

    app.panX=e.clientX-app.startMouseX;
    app.panY=e.clientY-app.startMouseY;

    updateViewport();

});

window.addEventListener("mouseup",()=>{

    app.isPanning=false;

    if(app.spacePressed){

        mapContainer.style.cursor="grab";

    }

});

document.getElementById("drawTool").onclick = () => {

    app.currentTool = "polygon";

    status.textContent = "Polygon Tool";

};

document.getElementById("pointerTool").onclick = () => {

    app.currentTool = "pointer";

    status.textContent = "Pointer Tool";

};

roomIdInput.addEventListener("input", () => {

    if (!app.selectedRoom) return;

    app.selectedRoom.id = roomIdInput.value;

    if (app.selectedRoom.label) {

        app.selectedRoom.label.textContent = roomIdInput.value;

    }

});

roomNameInput.addEventListener("input", () => {

    if (!app.selectedRoom) return;

    app.selectedRoom.name = roomNameInput.value;

});

roomNotesInput.addEventListener("input", () => {

    if (!app.selectedRoom) return;

    app.selectedRoom.notes = roomNotesInput.value;

});

document.getElementById("saveButton").onclick = async () => {

    const data = {

        version: 1,
        building: building.folder,
        exported: new Date().toISOString(),
        rooms: app.rooms.map(room => room.toObject())

    };

    const json = JSON.stringify(data, null, 4);

    const formData = new FormData();

    formData.append("rooms", json);

    const response = await fetch("saveRooms.php", {

        method: "POST",
        body: formData

    });

    if (response.ok) {

        status.textContent = "Rooms saved.";

    }
    else {

        status.textContent = "Save failed.";

    }

};

document.getElementById("exportButton").onclick = () => {

    const data = {

        version: 1,
        building: building.folder,
        exported: new Date().toISOString(),
        rooms: app.rooms.map(room => room.toObject())

    };

    const json = JSON.stringify(data, null, 4);

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${building.folder}_rooms.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    status.textContent = "Rooms exported.";

};

document.getElementById("deleteTool").onclick = () => {

    app.currentTool = "delete";

    status.textContent = "Delete Tool";

};

search.addEventListener("input", () => {

    const value = search.value.trim().toLowerCase();

    const room = app.rooms.find(r =>
        r.id.toLowerCase() === value
    );

    if (!room)
        return;

    app.roomEditor.selectRoom(room);

});

roomImageInput.addEventListener("change", async () => {

    if (!app.selectedRoom)
        return;

    if (roomImageInput.files.length === 0)
        return;

    const file = roomImageInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("uploadImage.php", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    app.selectedRoom.image = result.filename;

    roomImagePreview.src = "images/" + result.filename;
    roomImagePreview.style.display = "block";

});

async function loadRooms() {

    const response = await fetch(
        `buildings/${building.folder}/rooms.json`
    );

    if (!response.ok)
        return;

    const data = await response.json();

    app.roomEditor.clearRooms();

    for (const roomData of data.rooms) {

        const polygon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );

        polygon.setAttribute(
            "points",
            roomData.polygon
                .map(p => `${p[0]},${p[1]}`)
                .join(" ")
        );

        polygon.setAttribute("fill", "#C9A227");
        polygon.setAttribute("fill-opacity", "0.25");
        polygon.setAttribute("stroke", "#c9a32700");
        polygon.setAttribute("stroke-width", "0.5");

        const room = new Room(polygon);

        room.id = roomData.id;
        room.name = roomData.name;
        room.notes = roomData.notes;
        room.tags = roomData.tags || [];
        room.image = roomData.image || "";

        app.roomEditor.createRoom(room);

    }

}

start();