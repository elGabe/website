
window.onload = function() {

    const value = window.localStorage.getItem("useTiles")

    if (value == null) {
        setTiles()
        document.getElementById("btnTile").checked = true
    }

    if (value == "false") {
        setClean()
        document.getElementById("btnTile").checked = false
    } else if (value == "true") {
        setTiles()
        document.getElementById("btnTile").checked = true
    }
}

function onTileCheckboxUsed(element) {
    if (window.localStorage.getItem("useTiles") == "false") {
        setTiles()
    } else {
        setClean()
    }
}

function setTiles() {
    document.body.style["background"] = "url('/gabe.gif') repeat";
    document.body.style["background-size"] = "10%";
    window.localStorage.setItem("useTiles", "true");
}

function setClean() {
    document.body.style["background"] = "none";
    document.body.style["background-color"] = "var(--yellow)";
    window.localStorage.setItem("useTiles", "false");
}