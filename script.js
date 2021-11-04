let serverURL = 'http://localhost:4000'
let rows = 0;
let timenow = "";
let indexA = 0;

document.getElementById("add").addEventListener('click', () => {
    if (rows < 15) {
        rows++;
        let tr = document.createElement("tr");
        let td0 = document.createElement("td");
        let td1 = document.createElement("td");
        td0.innerHTML = `<input id="c${rows*2}" class="char" type="text" onkeypress="return /[0-9]/i.test(event.key)" maxlength="4"></input>`
        td1.innerHTML = `<input id="c${rows*2+1}" class="char" type="text" onkeypress="return /[0-9]/i.test(event.key)" maxlength="4"></input>`
        tr.appendChild(td0);
        tr.appendChild(td1);
        document.getElementById("timings").appendChild(tr);
    }
});

document.getElementById("sub").addEventListener("click", () => {
    if (rows > 0) {
        rows--;
        document.getElementsByTagName("tr")[rows + 2].remove();
    }
});

document.getElementById("dl").addEventListener("click", () => {
    const a = document.createElement('a');
    a.href = `${serverURL}/download?url=${document.getElementById('query').value}`;
    a.download = 'video.mp3';
    a.click();
})

document.getElementById("dist").addEventListener("click", () => {
    let maxlen = document.getElementById("maxlen").value;
    let cliplen = document.getElementById("cliplen").value;
    for(let i=0; i<=rows; i++){
        document.getElementById(`c${i*2}`).value = i*(Math.round((maxlen)/(rows+1)));
        document.getElementById(`c${i*2+1}`).value = (parseInt(document.getElementById(`c${i*2}`).value)+parseInt(cliplen));
    }
})

document.getElementById("create").addEventListener("click", () => {
    let timing = [];
    for (let i = 0; i <= rows; i++) {
        timing.push(document.getElementById(`c${i*2}`).value + "_" + document.getElementById(`c${i*2+1}`).value);

    }
    let obj = {
        url: document.getElementById('query').value,
        timings: timing,
    }
    alert("Downloading!");
    console.log("Starting")
    createParts(obj);
})

function myCallback(cutBlob, timings, blob) {
    const a = document.createElement("a");
    const blobmp3 = new Blob([cutBlob], {
        type: 'audio/mp3'
    });
    const blobURL = URL.createObjectURL(blobmp3);
    a.href = blobURL;
    a.download = `${timenow}_${indexA}.mp3`;
    a.click();

    timings.shift();
    indexA++;
    if (timings[0]) {
        execute(timings, blob);
    }
}

function execute(timings, blob) {
    const cutter = new mp3cutter();
    const start = timings[0].split("_")[0];
    const end = timings[0].split("_")[1];
    console.log(start, " ", end)
    cutter.cut(blob, start, end, cutBlob => myCallback(cutBlob, timings, blob));
}


async function createParts(data) {
    const res = await fetch(`${serverURL}/download?url=${data.url}`);
    const blob = await res.blob();
    timenow = "audio_" + Date.now();
    indexA = 0;
    execute(data.timings, blob);
}
