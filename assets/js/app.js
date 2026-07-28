const floorSelector = document.getElementById("floorSelector");
const svgContainer = document.getElementById("svgContainer");
const buildingTree = document.getElementById("buildingTree");
const status = document.getElementById("status");

const building = new Building("stbenedicts");

async function start() {

    status.textContent = "Loading building...";

    await building.load();

    createExplorer();

    populateFloorSelector();

    loadFloor(building.data.floors[0].id);

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

async function loadFloor(id) {

    const floor = building.getFloor(id);

    status.textContent = "Loading " + floor.name;

    const response = await fetch(
        `buildings/${building.folder}/${floor.svg}`
    );

    const svg = await response.text();

    svgContainer.innerHTML = svg;

    const loadedSvg = svgContainer.querySelector("svg");

    loadedSvg.style.width = "100%";
    loadedSvg.style.height = "auto";

    status.textContent = floor.name;

}

start();