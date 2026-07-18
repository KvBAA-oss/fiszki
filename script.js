// ============================================
// FISZKI APP - SCRIPT.JS
// CZĘŚĆ 1/2
// ============================================


// ----------------------------
// STAN APLIKACJI
// ----------------------------

let allCards = [];

let reviewCards = [];

let studyQueue = [];

let currentIndex = 0;

let studyMode = false;

let flipped = false;

let reverseMode = false;

let randomMode = false;

let sessionStats = {
    known: 0,
    unknown: 0
};




// ----------------------------
// ELEMENTY HTML
// ----------------------------

const flashcard =
document.getElementById("flashcard");

const front =
document.getElementById("front");

const back =
document.getElementById("back");


const counter =
document.getElementById("counter");

const progress =
document.getElementById("progress");



const nextButton =
document.getElementById("next");

const previousButton =
document.getElementById("previous");


const reviewModeButton =
document.getElementById("reviewMode");

const studyModeButton =
document.getElementById("studyMode");



const reviewControls =
document.getElementById("reviewControls");

const studyControls =
document.getElementById("studyControls");



const knowButton =
document.getElementById("know");

const dontKnowButton =
document.getElementById("dontKnow");



const finishScreen =
document.getElementById("finishScreen");

const restartButton =
document.getElementById("restart");



const reverseCheckbox =
document.getElementById("reverseMode");

const randomCheckbox =
document.getElementById("randomMode");





// ----------------------------
// WCZYTYWANIE FISZEK
// ----------------------------

async function loadCards(){

    try{

        const response =
        await fetch("cards.json");


        allCards =
        await response.json();


        reviewCards =
        [...allCards];


        loadSettings();


        showReviewCard();


    }
    catch(error){

        console.error(
            "Błąd:",
            error
        );


        front.innerHTML =
        "<p>Nie można załadować fiszek</p>";

    }

}




// ----------------------------
// TWORZENIE ZAWARTOŚCI KARTY
// tekst / obraz
// ----------------------------
function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

}


function renderSide(element, data){


    element.innerHTML = "";


    if(!data)
    return;



    if(data.type === "text"){


        let p =
        document.createElement("p");


        p.textContent =
        data.value;


        element.appendChild(p);

    }



    if(data.type === "image"){


        let img =
        document.createElement("img");


        img.src =
        data.value;


        img.loading =
        "lazy";


        element.appendChild(img);

    }

}




// ----------------------------
// POKAZANIE KARTY
// PRZEGLĄD
// ----------------------------

function showReviewCard(){


    if(reviewCards.length===0)
    return;



    let card =
    reviewCards[currentIndex];



    flashcard.classList.remove(
        "flipped"
    );


    flipped=false;



    let first =
    reverseMode
    ? card.back
    : card.front;


    let second =
    reverseMode
    ? card.front
    : card.back;



    renderSide(
        front,
        first
    );


    renderSide(
        back,
        second
    );



    counter.textContent =
    `${currentIndex+1} / ${reviewCards.length}`;



    progress.textContent =
    "Tryb: Przegląd";



}




// ----------------------------
// NASTĘPNA KARTA
// ----------------------------

function nextCard(){


    if(reviewCards.length===0)
    return;



    if(randomMode){


        let next;


        do{

            next =
            Math.floor(
                Math.random()
                *
                reviewCards.length
            );


        }
        while(
            next===currentIndex
            &&
            reviewCards.length>1
        );


        currentIndex=next;


    }
    else{


        currentIndex++;


        if(
            currentIndex >= reviewCards.length
        ){

            currentIndex=0;

        }

    }



    showReviewCard();

}





// ----------------------------
// POPRZEDNIA KARTA
// ----------------------------

function previousCard(){


    currentIndex--;


    if(currentIndex<0){

        currentIndex =
        reviewCards.length-1;

    }


    showReviewCard();

}




// ----------------------------
// OBRÓT FISZKI
// ----------------------------

flashcard.addEventListener(
"click",
()=>{


    flashcard.classList.toggle(
        "flipped"
    );


});





// ----------------------------
// OPCJE
// ----------------------------

reverseCheckbox.addEventListener(
"change",
(e)=>{


    reverseMode =
    e.target.checked;


    saveSettings();


    if(studyMode){

        showStudyCard();

    }
    else{

        showReviewCard();

    }


});



randomCheckbox.addEventListener(
"change",
(e)=>{


    randomMode =
    e.target.checked;


    saveSettings();


});





// ----------------------------
// PRZYCISKI PRZEGLĄDU
// ----------------------------

nextButton.addEventListener(
"click",
nextCard
);


previousButton.addEventListener(
"click",
previousCard
);





// ----------------------------
// KLAWIATURA
// ----------------------------

document.addEventListener(
"keydown",
(e)=>{


    if(e.code==="Space"){

        flashcard.click();

    }



    if(e.key==="ArrowRight"){


        if(studyMode)
        return;


        nextCard();

    }



    if(e.key==="ArrowLeft"){


        if(studyMode)
        return;


        previousCard();

    }


});


// ============================================
// TRYB NAUKI
// ============================================



function startStudy() {

    studyMode = true;

    studyQueue = [...allCards];

    if (randomMode) {
        shuffle(studyQueue);
    }

    sessionStats = {
        known: 0,
        unknown: 0
    };

    reviewControls.classList.add("hidden");
    studyControls.classList.remove("hidden");
    finishScreen.classList.add("hidden");

    showStudyCard();
}





function showStudyCard(){


    if(studyQueue.length===0){

        finishStudy();

        return;

    }



    let card =
    studyQueue[0];



    flashcard.classList.remove(
        "flipped"
    );



    let first =
    reverseMode
    ? card.back
    : card.front;



    let second =
    reverseMode
    ? card.front
    : card.back;



    renderSide(
        front,
        first
    );


    renderSide(
        back,
        second
    );



    counter.textContent =
    `Pozostało: ${studyQueue.length}`;



    let done =
    allCards.length -
    studyQueue.length;



    progress.textContent =
    `Opanowane: ${done} / ${allCards.length}`;

}




// ----------------------------
// UMIEM
// ----------------------------

function knowCard(){


    studyQueue.shift();


    sessionStats.known++;


    showStudyCard();


}





// ----------------------------
// NIE UMIEM
// ----------------------------

function dontKnowCard(){


    let card =
    studyQueue.shift();



    studyQueue.push(card);



    sessionStats.unknown++;


    showStudyCard();


}





// ----------------------------
// KONIEC SESJI
// ----------------------------

function finishStudy(){


    studyControls.classList.add(
        "hidden"
    );


    finishScreen.classList.remove(
        "hidden"
    );


    counter.textContent =
    "100%";


    progress.innerHTML =
    `
    🎉 Sesja zakończona<br>
    ✅ Umiem: ${sessionStats.known}<br>
    ❌ Powtórki: ${sessionStats.unknown}
    `;


}





// ----------------------------
// RESTART NAUKI
// ----------------------------

function restartStudy() {

    studyQueue = [...allCards];

    if (randomMode) {
        shuffle(studyQueue);
    }

    sessionStats = {
        known: 0,
        unknown: 0
    };

    finishScreen.classList.add("hidden");
    studyControls.classList.remove("hidden");

    showStudyCard();
}





// ----------------------------
// PRZEŁĄCZANIE TRYBÓW
// ----------------------------


studyModeButton.addEventListener(
"click",
()=>{


    studyModeButton.classList.add(
        "active"
    );


    reviewModeButton.classList.remove(
        "active"
    );


    startStudy();


});





reviewModeButton.addEventListener(
"click",
()=>{


    studyMode=false;



    studyModeButton.classList.remove(
        "active"
    );


    reviewModeButton.classList.add(
        "active"
    );



    studyControls.classList.add(
        "hidden"
    );


    reviewControls.classList.remove(
        "hidden"
    );


    finishScreen.classList.add(
        "hidden"
    );



    currentIndex=0;


    showReviewCard();


});





// ----------------------------
// PRZYCISKI NAUKI
// ----------------------------


knowButton.addEventListener(
"click",
knowCard
);



dontKnowButton.addEventListener(
"click",
dontKnowCard
);



restartButton.addEventListener(
"click",
restartStudy
);






// ----------------------------
// ZAPIS USTAWIEŃ
// ----------------------------


function saveSettings(){


    localStorage.setItem(
        "reverseMode",
        reverseMode
    );


    localStorage.setItem(
        "randomMode",
        randomMode
    );


}




function loadSettings(){


    reverseMode =
    localStorage.getItem(
        "reverseMode"
    )==="true";



    randomMode =
    localStorage.getItem(
        "randomMode"
    )==="true";



    reverseCheckbox.checked =
    reverseMode;


    randomCheckbox.checked =
    randomMode;


}





// ----------------------------
// GESTY TELEFON
// prawo = umiem
// lewo = nie umiem
// ----------------------------


let touchStartX=0;


let touchEndX=0;



flashcard.addEventListener(
"touchstart",
(e)=>{


    touchStartX =
    e.changedTouches[0].screenX;


});





flashcard.addEventListener(
"touchend",
(e)=>{


    touchEndX =
    e.changedTouches[0].screenX;



    if(!studyMode)
    return;



    let distance =
    touchEndX-touchStartX;



    if(distance>80){

        knowCard();

    }



    if(distance<-80){

        dontKnowCard();

    }


});





// ----------------------------
// START APLIKACJI
// ----------------------------


loadCards();
