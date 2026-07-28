class Building {

    constructor(folder) {
        this.folder = folder;
        this.data = null;
    }

    async load() {

        console.log(`Loading buildings/${this.folder}/building.json`);

        const response = await fetch(`buildings/${this.folder}/building.json`);

        console.log(response);

        this.data = await response.json();

        return this.data;

    }

    getFloor(id) {
        return this.data.floors.find(f => f.id === id);
    }

}