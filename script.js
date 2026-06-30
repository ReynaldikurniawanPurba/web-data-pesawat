// ==========================
// DATA DEFAULT
// ==========================

let kriteria = [
    { id: "C1", name: "Volume Penjualan", weight: 40 },
    { id: "C2", name: "Backlog", weight: 30 },
    { id: "C3", name: "Efisiensi BBM", weight: 20 },
    { id: "C4", name: "Harga", weight: 10 }
];

let alternatif = [
    { id: "A1", name: "Airbus A320neo" },
    { id: "A2", name: "Boeing 737 MAX" },
    { id: "A3", name: "COMAC C919" }
];

let matriks = {
    A1:{C1:1,C2:1,C3:1,C4:2},
    A2:{C1:2,C2:2,C3:2,C4:3},
    A3:{C1:3,C2:3,C3:3,C4:1}
};

window.onload=()=>renderAll();

function updateDashboard(){
    document.getElementById("jumlahKriteria").innerText=kriteria.length;
    document.getElementById("jumlahAlternatif").innerText=alternatif.length;
}

function addKriteria(){

    let nama=document.getElementById("critName").value.trim();
    let bobot=parseFloat(document.getElementById("critWeight").value);

    if(nama==""||isNaN(bobot)){
        alert("Lengkapi data");
        return;
    }

    let id="C"+(kriteria.length+1);

    kriteria.push({
        id:id,
        name:nama,
        weight:bobot
    });

    document.getElementById("critName").value="";
    document.getElementById("critWeight").value="";

    renderAll();

}

function deleteKriteria(index){

    kriteria.splice(index,1);

    kriteria.forEach((x,i)=>{
        x.id="C"+(i+1);
    });

    renderAll();

}

function addAlternatif(){

    let nama=document.getElementById("altName").value.trim();

    if(nama==""){
        alert("Isi nama pesawat");
        return;
    }

    let id="A"+(alternatif.length+1);

    alternatif.push({
        id:id,
        name:nama
    });

    matriks[id]={};

    document.getElementById("altName").value="";

    renderAll();

}

function deleteAlternatif(index){

    delete matriks[alternatif[index].id];

    alternatif.splice(index,1);

    alternatif.forEach((x,i)=>{
        x.id="A"+(i+1);
    });

    renderAll();

}

function updateMatriks(a,c,v){

    if(!matriks[a]) matriks[a]={};

    matriks[a][c]=parseFloat(v);

}

function renderAll(){

updateDashboard();

//====================
// KRITERIA
//====================

document.getElementById("kriteriaTable").innerHTML=
kriteria.map((x,i)=>`

<tr>

<td class="p-3 font-bold text-cyan-400">${x.id}</td>

<td class="p-3">${x.name}</td>

<td class="p-3">${x.weight}%</td>

<td class="p-3">

<button
onclick="deleteKriteria(${i})"
class="bg-red-600 px-3 py-1 rounded">

Hapus

</button>

</td>

</tr>

`).join("");


//====================
// ALTERNATIF
//====================

document.getElementById("alternatifTable").innerHTML=
alternatif.map((x,i)=>`

<tr>

<td class="p-3 font-bold text-purple-400">${x.id}</td>

<td class="p-3">${x.name}</td>

<td class="p-3">

<button
onclick="deleteAlternatif(${i})"
class="bg-red-600 px-3 py-1 rounded">

Hapus

</button>

</td>

</tr>

`).join("");


//====================
// HEADER MATRIKS
//====================

document.getElementById("matrixHead").innerHTML=`

<tr>

<th class="p-3">

Alternatif

</th>

${kriteria.map(x=>`

<th class="p-3">

${x.id}

</th>

`).join("")}

</tr>

`;


//====================
// BODY MATRIKS
//====================

document.getElementById("matrixBody").innerHTML=

alternatif.map(a=>`

<tr>

<td class="p-3 font-bold">

${a.name}

</td>

${kriteria.map(c=>`

<td class="p-2">

<input

type="number"

value="${matriks[a.id]?.[c.id]??""}"

onchange="updateMatriks('${a.id}','${c.id}',this.value)"

class="bg-slate-900 border border-slate-700 rounded p-2 w-20 text-center">

</td>

`).join("")}

</tr>

`).join("");

}
// =========================
// PERHITUNGAN METODE ORESTE
// =========================

function hitungOreste(){

    if(kriteria.length===0 || alternatif.length===0){
        alert("Data belum lengkap.");
        return;
    }

    // Validasi Input
    for(let a of alternatif){

        for(let c of kriteria){

            if(
                matriks[a.id]?.[c.id]===undefined ||
                isNaN(matriks[a.id][c.id])
            ){

                alert(
                    "Lengkapi nilai " +
                    a.name +
                    " pada " +
                    c.name
                );

                return;

            }

        }

    }

    // ==========================
    // RANKING BOBOT KRITERIA
    // ==========================

    let urutBobot=[...kriteria].sort((a,b)=>b.weight-a.weight);

    let rankKriteria={};

    let i=0;

    while(i<urutBobot.length){

        let j=i;

        let total=0;

        while(
            j<urutBobot.length &&
            urutBobot[j].weight===urutBobot[i].weight
        ){

            total+=(j+1);

            j++;

        }

        let rata=total/(j-i);

        for(let k=i;k<j;k++){

            rankKriteria[
                urutBobot[k].id
            ]=rata;

        }

        i=j;

    }

    // ==========================
    // HITUNG NILAI ORESTE
    // ==========================

    let alpha=3;

    let hasil=[];

    alternatif.forEach(a=>{

        let totalD=0;

        kriteria.forEach(c=>{

            let rankAlt=
                matriks[a.id][c.id];

            let rankCrit=
                rankKriteria[c.id];

            let D=Math.pow(

                0.5*(
                    Math.pow(rankAlt,alpha)+
                    Math.pow(rankCrit,alpha)
                ),

                1/alpha

            );

            totalD+=D;

        });

        let nilaiS=
            totalD/kriteria.length;

        hasil.push({

            id:a.id,

            name:a.name,

            score:nilaiS

        });

    });

    // ==========================
    // SORTING
    // ==========================

    hasil.sort(
        (a,b)=>a.score-b.score
    );

    // ==========================
    // TAMPILKAN HASIL
    // ==========================

    let html="";

    hasil.forEach((x,index)=>{

        let warna="";

        let medal="";

        if(index===0){

            warna="bg-green-900";

            medal="🥇";

        }else if(index===1){

            warna="bg-slate-800";

            medal="🥈";

        }else if(index===2){

            warna="bg-slate-700";

            medal="🥉";

        }

        html+=`

        <tr class="${warna}">

            <td class="p-3">

                ${medal} ${index+1}

            </td>

            <td class="p-3">

                ${x.name}

            </td>

            <td class="p-3 font-bold text-cyan-300">

                ${x.score.toFixed(4)}

            </td>

        </tr>

        `;

    });

    document.getElementById(
        "rankingTable"
    ).innerHTML=html;

    document
        .getElementById(
            "hasilSection"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "hasilSection"
        )
        .scrollIntoView({

            behavior:"smooth"

        });

}
