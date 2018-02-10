// ==UserScript==
// @name Tendances Live
// @description Offre plusieurs setups pour l'affichage des topics, permet entre autres de mettre en avant les topics les plus up | Peut rafraîchir la liste des topics | Système Start & Stop | Peut trier la liste par taux de popularité | Peut rafraîchir le compteur de connecté
// @author TendancesLive
// @match http://www.jeuxvideo.com/forums/0-*
// @run-at document-end
// @version 2.6
// @grant none
// @noframes
// ==/UserScript==

/////////////////// OPTIONS ///////////////////////////////////////////////////////

// La vitesse de rafraichissement de la page
// 1 = LENTE, refresh TOUTES LES 10 SECS
// 2 = RAPIDE, refresh TOUTES LES 5 SECS
var VITESSE_F5 = 1;

//// COULEURS TOPICS /////////////////////////////////////////////////////////////
var colorLight = 'rgba(253, 200, 61, 0.2)'; //rgba(r, g, b, opacity) couleur d'un topic devenant populaire
var colorMedium = 'rgba(253, 162, 61, 0.3)'; //rgba(r, g, b, opacity) couleur d'un topic populaire
var colorHeavy = 'rgba(253, 139, 61, 0.4)'; //rgba(r, g, b, opacity) couleur d'un topic très populaire

/////////////////// FIN DES OPTIONS ////////////////////////////////////////////////

// Nombre de secondes avant que les topics en tendance soient mis à jour (qu'une nouvelle page soit téléchargée)
// Ne modifier que si votre page s'affiche en plus de 3 secondes
// Vitesse d'affichage habituelle entre 0 et 400 ms
var timerRefreshTrend = 3;

// Nombre de secondes avant que la requête envoyée pour avoir la page rafraichie soit abandonnée
var connexionTimeOut = timerRefreshTrend;

// NE PAS MODIFIER PLUS BAS ////////////////////////////////////////
if (VITESSE_F5 < 2) {
    var timerRefreshPage = 5;
}
else {
    var timerRefreshPage = 10;
}
// Met à jour la direction du tri de la page en fonction de la direction de la flèche de tri
var direction = 0;
function updateSortDirection(tab, tabId) {
    if (tab.classList.contains('active')) {
        if (tab.classList.contains('down')) {
            tab.classList.remove('down');
            tab.classList.add('up');
            direction = 1;
        }
        else {
            direction = 0;
            tab.classList.remove('up');
            tab.classList.add('down');
        }
    }
    else {
        if (tab.classList.contains('down')) {
            direction = 0;
        }
        else {
            direction = 1;
        }
    }
}
// Généralement plus rapide que indexOf() en ce moment
function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
}
// Flags 
var areTrendDsp = false;
var areTrendSort = false;
var areTopicsRefr = false;
var areTopicsSort = false;
var areTopicsCol = true;
var isActiveTabRefr = false;
// si la tab active est la 3 || 4, trier les topics en fonction des tendances, sinon mettre l'ordre par défaut
var isActiveTabSort = false;
// si la tab active est la 2 || 3 || 4, colorer les topics en fonction des tendances, sinon mettre la couleur par défaut
var areTopicsColorsMod = false;
var isHoverButton = false;
var isHoverCursor = false;
function States(info) {
    var inArr = inArray;
    return {
        setAreTrendDsp: function(info) { areTrendDsp = inArr(info, [3]); },
        setAreTrendSort: function(info) { areTrendSort = inArr(info, [3]); },
        setAreTopicsRefr: function(info) { areTopicsRefr = info; },
        setAreTopicsSort: function(info) { areTopicsSort = info; },
        setIsActiveTabRefr: function(info) { isActiveTabRefr = inArr(info, [1, 2, 3]); },
        setIsActiveTabSort: function(info) { isActiveTabSort = inArr(info, [2, 3]); },
        setAreTopicsColorsMod: function(info) { areTopicsColorsMod = inArr(info, [1, 2, 3]); },
        setAreTopicsCol: function(info) { areTopicsCol = info; },
        setIsHoverButton: function(info) { isHoverButton = info; },
        setIsHoverCursor: function(info) { isHoverCursor = info; },
        setUpdDirection: function(info) { // *lancé avant de rafraichir la classe* 
            if (inArr(info, [2, 3])) { updateSortDirection(this, info); }
        }
    };
}
function reverseRun(array, lo, hi) {
    hi--;
    while (lo < hi) {
        var t = array[lo];
        array[lo++] = array[hi];
        array[hi--] = t;
    }
}
function makeAscendingRun(array, lo, hi, compare) {
    var runHi = lo + 1;
    if (runHi === hi) {
        return 1;
    }
    if (compare(array[runHi++][1].dataset.poids, array[lo][1].dataset.poids) < 0) {
        while (runHi < hi && compare(array[runHi][1].dataset.poids, array[runHi - 1][1].dataset.poids) < 0) {
            runHi++;
        }
        reverseRun(array, lo, runHi);
    }
    else {
        while (runHi < hi && compare(array[runHi][1].dataset.poids, array[runHi - 1][1].dataset.poids) >= 0) {
            runHi++;
        }
    }
    return runHi - lo;
}
function binaryInsertionSort(array, lo, hi, compare) {
    var start = 1;
    for (; start < hi; start++) {
        var pivot = array[start];
        var left = lo;
        var right = start;
        while (left < right) {
            var mid = left + right >>> 1;
            if (compare(pivot[1].dataset.poids, array[mid][1].dataset.poids) < 0) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }
        var n = start - left;
        switch (n) {
            case 3:
                array[left + 3] = array[left + 2];
            case 2:
                array[left + 2] = array[left + 1];
            case 1:
                array[left + 1] = array[left];
                break;
            default:
                while (n > 0) {
                    array[left + n] = array[left + n - 1];
                    n--;
                }
        }
        array[left] = pivot;
    }
}
// tri les topics par poids
function sortByWeight(array) {
    var length = array.length;
    var compare = direction ? ((x, y) => x - y) : ((x, y) => y - x);
    var lo = 0;
    var hi = length;
    runLength = makeAscendingRun(array, lo, hi, compare);
    binaryInsertionSort(array, lo, hi, compare);
}
var topicsTrend = [];
// Refresh le topic de la page rafraichie envoyée (nb message, poids, titre, heure dernier message)
function refreshTopic(topic) {
    var flag = 0;
    var len = topicsTrend.length;
    for (var i = 0; i < len; i++) {
        if (topicsTrend[i][0] == topic[0]) {
            topic[1] = topicsTrend[i][1];
            flag = 1;
            break;
        }
    }
    if (flag === 0) {
        topic[1].dataset.poids = 1;
    }
    return topic;
}
// Elements contenant les infos de chaque topics, [0] est l'id, [1] est le node du topic (<li>)
function ElementListe(id, element) { // Topic
    return new Array(id, element);
}
var pageLen = 0;
// recupère les topics sur la page en paramètre (page actuelle ou refresh)
function getTopics(page, trendCall) {
    var el = ElementListe;
    var refrTopic = refreshTopic;
    var inArr = inArray;
    var liste = page.getElementsByClassName('topic-list topic-list-admin')[0].cloneNode(true);
    var elements = liste.getElementsByTagName('li');
    var eleLen = elements.length;
    var topics = [];
    for (var i = 0; i < eleLen; i++) {
        if (!inArr(elements[i].className, ['topic-head', 'ads-middle'])) { // filtre par class name
            topics.push(elements[i]);
        }
    }
    var length = topics.length;
    pageLen = length; // assigne la taille de la page à une variable globale pour l'utiliser lors de l'affichage
    var topicsCurrentPage = [];
    var epingles = [];
    for (var x = 0; x < length; x++) {
        if (topics[x].getElementsByClassName('topic-img')[0].alt == "Topic épinglé") {
            // récupère les éléments sur la page actualisée - Met l'id des topics épinglés à 0 car obsolètes ici
            epingles.push(el(0, topics[x]));
        }
        else {
            if (!trendCall) {
                if (areTrendDsp && areTopicsRefr) {
                    for (var y = 0; y < topicsTrend.length; y++) {
                        topicsCurrentPage.push(topicsTrend[y]);
                    }
                    break;
                }
                // récupère les éléments sur la page actualisée et rafraîchit élément(titre, nb messages, poids)
                topicsCurrentPage.push(refrTopic(el(topics[x].dataset.id, topics[x])));
            }
            else { topicsCurrentPage.push(el(topics[x].dataset.id, topics[x])); }
        }
    }
    return [
        epingles,
        topicsCurrentPage
    ];
}
// augmente - diminue le poids - met à jour <li> des topics dans la liste des tendances et supprime les topics avec un poids de 0
function processTrend(topicsArray) {
    var el = ElementListe;
    var topicsTrendTemp = topicsTrend.slice();
    var topicsLength = topicsArray.length;
    var trendLength = topicsTrend.length;
    // add 1 au poids des topics en tendance sur la première page et ajoute les nouveaux topics en tendance
    for (var x = 0; x < topicsLength; x++) {
        var flag = 0;
        if (trendLength > 0) {
            for (var y = 0; y < trendLength; y++) {
                // si le topic actualisé courant a été trouvé dans la liste des tendances
                if (topicsTrendTemp[y][0] == topicsArray[x][0]) {
                    flag = 1;
                    var tmp = topicsArray[x][1].cloneNode(true);
                    // add + 1 au poids des topics en tendance sur la première page actualisée
                    tmp.dataset.poids = parseInt(topicsTrendTemp[y][1].dataset.poids) + 1;
                    // remplace le topic par le topic de la liste mis à jour (couleur img et nombre de messages et poids)
                    topicsTrendTemp[y][1] = tmp;
                    break;
                }
            }
        }
        if (flag === 0) { // si le topic actualisé courant n'a pas été trouvé dans la liste des tendances
            var topic = el(topicsArray[x][0], topicsArray[x][1].cloneNode(true));
            topic[1].dataset.poids = 1;
            topicsTrendTemp.push(topic); // Ajoute les nouveaux topics en tendance
        }
    }
    trendLength = topicsTrendTemp.length;
    if (trendLength > 0) {
        // remove 1 au poids des topics en tendance pas sur la première page et supprime les anciens topics en tendance
        for (var x = 0; x < trendLength; x++) {
            flag = 0;
            if (topicsTrendTemp[x][1].dataset.poids == 0) {
                // supprimé des tendances si trop vieux
                topicsTrendTemp.splice(x, 1);
                x--;
                trendLength--;
            }
            else {
                for (var y = 0; y < topicsLength; y++) {
                    // si le Trend topic courant a été trouvé dans la liste refresh
                    if (topicsTrendTemp[x][0] == topicsArray[y][0]) {
                        flag = 1; // trouvé
                        break;
                    }
                }
                if (flag === 0) { // si le Trend topic courant n'a pas été trouvé dans la liste refresh
                    if (topicsTrendTemp[x][1].dataset.poids > 0) {
                        // remove -1 au poids du Trend topic courant
                        topicsTrendTemp[x][1].dataset.poids = parseInt(topicsTrendTemp[x][1].dataset.poids) - 1;
                    }
                }
            }
        }
    }
    return topicsTrendTemp;
}
// dl la page refresh et lance la mise à jour de la liste des tendances
function updateTopicsTrend(page) {
    var topicsArray = getTopics(page, true)[1];
    topicsTrend = processTrend(topicsArray);
}
// Met à jour le compteur de connectés
function updateNbCo(page) {
    var fragment = document.createDocumentFragment();
    fragment.appendChild(page.getElementsByClassName('nb-connect-fofo')[0].cloneNode(true));
    var element = document.getElementsByClassName('nb-connect-fofo')[0];
    element.parentNode.replaceChild(fragment, element);
}
function setCssTopics(topics) {
    var len = topics.length;
    for (var i = 0; i < len; i++) {
        if (!areTopicsCol) {
            topics[i][1].classList.remove('light', 'medium', 'heavy', 'basic');
        }
        else {
            if (areTopicsColorsMod) {
                topics[i][1].classList.remove('light', 'medium', 'heavy', 'basic');
                if (parseInt(topics[i][1].dataset.poids) > 24) {
                    topics[i][1].classList.add('heavy');
                }
                else if (parseInt(topics[i][1].dataset.poids) > 16) {
                    topics[i][1].classList.add('medium');
                }
                else if (parseInt(topics[i][1].dataset.poids) > 10) {
                    topics[i][1].classList.add('light');
                }
                else {
                    // met tous les background-color de la même couleur par défaut
                    // - la couleur est prise sur le background-color du deuxième topic de la liste
                    topics[i][1].classList.add('basic');
                }
            }
            else {
                topics[i][1].classList.remove('light', 'medium', 'heavy', 'basic');
            }
        }
    }
}
var hoverCursor = 0;
var topicHead = document.getElementsByClassName('topic-list topic-list-admin')[0].getElementsByTagName("li")[0];
// actualise l'affichage des topics
function displayTopicsCurrentPage(page) {
    if (!isActiveTabRefr) {
        return;
    }
    var topicsArray = [];
    // Obtention de la liste des topics
    if (page == null) {
        topicsArray = getTopics(document, false);
    }
    else {
        // met à jour compteur de connecté quand on affiche une liste rafraichir
        updateNbCo(page);
        topicsArray = getTopics(page, false);
    }
    // on sépare les topics épinglés des topics normaux
    var epingles = topicsArray[0];
    var topicsCurrentPage = topicsArray[1];
    // si l'onglet tri et affiche seulement la liste des tendances
    // ou que
    // la liste n'est pas bloquée et que l'onglet courant est trié
    // Trier la liste à afficher par poids en tendance
    if (((areTrendDsp && areTrendSort) && areTopicsSort) ||
        (areTopicsSort && isActiveTabSort)) {
        sortByWeight(topicsCurrentPage);
    }
    // Applique la couleur sur les topics
    setCssTopics(topicsCurrentPage);
    var ul = document.createElement('ul');
    ul.classList.add('topic-list', 'topic-list-admin');
    ul.appendChild(topicHead);
    // copie les épingles en premier dans la liste qui va être affichée
    var lengthPinned = epingles.length;
    for (var x = 0; x < lengthPinned; x++) {
        ul.appendChild(epingles[x][1]);
    }
    // puis copie les topics
    var lengthNotPinned = pageLen - lengthPinned;
    for (var x = 0; x < lengthNotPinned; x++) {
        ul.appendChild(topicsCurrentPage[x][1]);
    }
    var fragmentUL = document.createDocumentFragment();
    fragmentUL.appendChild(ul.cloneNode(true));
    var element = document.getElementsByClassName('topic-list topic-list-admin')[0];
    // Affiche
    element.parentNode.replaceChild(fragmentUL, element);
    // Met en place le blocage du rafraichissement des topics lorsque le curseur est sur la nouvelle liste affichée
    var conteneur = document.getElementsByClassName('conteneur-topic-pagi')[0];
    conteneur.addEventListener("mouseenter", function(e) { states.setIsHoverCursor(true); }, false);
    conteneur.addEventListener("mouseleave", function(e) { states.setIsHoverCursor(false); }, false);
}
function displayRedCross(state) {
    var redCross = document.getElementById('red-cross');
    if (state) redCross.classList.remove('hidden');
    else redCross.classList.add('hidden');
}
var htmlPageRefr = null; // page rafraichie mise en cache jusqu'au prochain dl dans la fonction ci-dessous
function createXHR(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = connexionTimeOut * 1000;
    xhr.ontimeout = function() {
        displayRedCross(true)
    };
    // éviter que les navigateurs chargent une page mise en cache
    xhr.setRequestHeader("Cache-Control", "max-age=0,no-cache,no-store,post-check=0,pre-check=0");
    xhr.onload = function() {
        displayRedCross(false);
        var parser = new DOMParser();
        var htmlReload = parser.parseFromString(this.responseText, "text/html");
        htmlPageRefr = htmlReload;
        // Appel la fonction qui va traitée la nouvelle page téléchargée
        callback(htmlReload);
    };
    xhr.send(null);
}
// refresh la liste et le poids des topics en tendance
function refreshTrend() {
    createXHR(window.location.href, updateTopicsTrend);
}
function initCSS() {
    var fontColor = window.getComputedStyle(document.getElementsByClassName('topic-title')[0]).getPropertyValue('color');
    var element = document.getElementsByClassName('topic-list topic-list-admin')[0];
    var liste = element.getElementsByTagName("li");
    if (liste.length > 2)
        var backgroundColor = window.getComputedStyle(liste[2]).getPropertyValue('background-color');
    else
        var backgroundColor = "#FFF";
    document.head.innerHTML = "<style>" +
        ".conteneur-topic-pagi:hover > .topic-list.topic-list-admin{border: 1px solid #999}" +
        ".categoryButtons{height:14px;margin: 0;padding: 0px; margin-left:2px;-webkit-user-select: none;-moz-user-select: none;-khtml-user-select: none;-ms-user-select: none;}" +
        ".categoryButtons > li{height:14px;display:inline-block;list-style: none;border: 1px solid " + backgroundColor + ";border-bottom: 0px;font-size: 11px;font-weight: bold;padding: 0px 3px;margin-right: 2px;line-height: 13px;" +
        "float:left;border-top-left-radius:3px; border-top-right-radius:3px; cursor: pointer; color: " + fontColor + ";background-color:" + backgroundColor + "}" +
        ".categoryButtons > li.active{background-color:#CCC;color: " + backgroundColor + " !important;background-color:" + fontColor + " !important;border-color:" + fontColor + " !important}" +
        ".basic{background-color:" + backgroundColor + " !important}" +
        ".light{background-color:" + colorLight + " !important}" +
        ".medium{background-color:" + colorMedium + " !important}" +
        ".heavy{background-color:" + colorHeavy + " !important}" +
        ".categoryButtons > li:nth-of-type(3):after, .categoryButtons > li:nth-of-type(4):after {padding-left:2px}" +
        ".categoryButtons > li.down:nth-of-type(3):after, .categoryButtons > li.down:nth-of-type(4):after {content: '\\25bc'}" +
        ".categoryButtons > li.up:nth-of-type(3):after, .categoryButtons > li.up:nth-of-type(4):after {content: '\\25b2'}" +
        "#lock-container {display: block;position: relative;cursor: pointer;-moz-user-select: none;-ms-user-select: none;user-select: none;height:14px;float: left;margin-bottom: 0px;margin-right:2px;margin-left:1px}" +
        "#lock-container input {position: absolute;opacity: 0;cursor: pointer;}" +
        "#lock-container .checkmark {display: block;height: 14px;width: 20px;float: right;background-color: #FB3C41 !important;border-radius: 2px;}" +
        "#lock-container input:checked ~ .checkmark {background-color: #55D533 !important;line-height: 11px;}" +
        ".slide {width: 50px;height: 14px;background: " + fontColor + ";position: relative;display:block;float:left;border-radius: 50px;box-shadow: inset 0px 1px 1px rgba(0,0,0,0.5), 0px 1px 0px rgba(255,255,255,0.2);}" +
        ".slide:after {content: 'OFF';color: " + backgroundColor + ";position: absolute;right: 5px;top:3px;z-index: 0;font: 8px Arial, sans-serif;text-shadow: 1px 1px 0px rgba(255,255,255,.15);font-weight:bold;line-height: 8px;}" +
        ".slide:before {content: 'ON';color: " + backgroundColor + ";position: absolute;left: 7px;top:3px;z-index: 0;font: 8px Arial, sans-serif;font-weight:bold;line-height: 8px;}" +
        ".slide label {display: block;width: 26px;height: 14px;cursor: pointer;position: absolute;top: 0px;left: -1px;z-index: 1;background: #fcfff4;background: " + backgroundColor + ";border-radius: 50px;transition: all 0.4s ease;0px 1px 0px 0px rgba(0,0,0,0.3)}" +
        ".slide input[type=checkbox]{visibility: hidden;}" +
        ".slide input[type=checkbox]:checked + label {left: 25px;}" +
        "#red-cross {color: #ED1B10;font-family: 'Helvetica', 'Arial', sans-serif;font-size: 13px;font-weight: bold;text-align: center;width: 14px;height: 14px;display: block;float: left;margin-left: 1px;padding-bottom: 1px;}" +
        ".hidden{}" +
        "</style >" + document.head.innerHTML;
}
function processNotHover() {
    states.setAreTopicsRefr(true);
    states.setAreTopicsSort(true);
    if (htmlPageRefr != null) {
        displayTopicsCurrentPage(htmlPageRefr);
        return;
    }
    createXHR(window.location.href, displayTopicsCurrentPage);
}
function processHover() {
    states.setAreTopicsRefr(false);
    states.setAreTopicsSort(false);
    displayTopicsCurrentPage(null);
}
var activeTab = 0;
var states = States();
function initUI() {
    var cont = document.getElementsByClassName("conteneur-topic-pagi")[0];
    var contClone = cont.cloneNode(true);
    var childs = contClone.children;
    var len = childs.length;
    var ul = document.createElement('ul');
    var html = "";
    for (var x = 0; x < len; x++) {
        if (childs[x].className == "topic-list topic-list-admin") {
            html += "<ul class='categoryButtons'>" +
                "<li data-id='0' class='active'>Classic</li>" +
                "<li data-id='1'>Live</li>" +
                "<li data-id='2' class='down'>Populaires</li>" +
                "<li data-id='3' class='down'>Les plus up</li>" +
                "<label id='lock-container'><input type='checkbox' checked><span class='checkmark'></span></label>" +
                "<div class='slide'><input type='checkbox' value='None' id='slide' name='check' checked /><label for='slide'></label></div>" +
                "<div id='red-cross' class='hidden'>X</div>" +
                "</ul >";
        }
        html += childs[x].outerHTML;
    }
    cont.innerHTML = html;
    var procNotHover = processNotHover;
    var li = document.getElementsByClassName('categoryButtons')[0];
    var lenButtons = li.length;
    li.addEventListener('click', function(e) {
        var elem, evt = e ? e : event;
        if (evt.srcElement) {
            elem = evt.srcElement;
        }
        else if (evt.target) {
            elem = evt.target;
        }
        if (elem && ('LI' !== elem.tagName.toUpperCase())) {
            return true;
        }
        var liste = elem.parentNode.getElementsByTagName('li');
        activeTab = elem.dataset.id;
        var len = liste.length;
        states.setUpdDirection.call(elem, activeTab);
        states.setAreTrendSort(activeTab);
        states.setAreTrendDsp(activeTab);
        states.setIsActiveTabSort(activeTab);
        states.setIsActiveTabRefr(activeTab);
        states.setAreTopicsColorsMod(activeTab);
        for (var x = 0; x < len; x++) {
            liste[x].classList.remove('active');
        }
        elem.classList.add('active');
        procNotHover();
    });
    var label = document.getElementById('lock-container');
    label.addEventListener('click', function(e) {
        var elem, evt = e ? e : event;
        if (evt.srcElement) {
            elem = evt.srcElement;
        }
        else if (evt.target) {
            elem = evt.target;
        }
        if (elem && ('INPUT' !== elem.tagName.toUpperCase())) {
            return true;
        }
        if (elem.checked) {
            states.setIsHoverButton(false);
        }
        else {
            states.setIsHoverButton(true);
        }
    });
    var label = document.getElementsByClassName('slide')[0];
    label.addEventListener('click', function(e) {
        var elem, evt = e ? e : event;
        if (evt.srcElement) {
            elem = evt.srcElement;
        }
        else if (evt.target) {
            elem = evt.target;
        }
        if (elem && ('INPUT' !== elem.tagName.toUpperCase())) {
            return true;
        }
        if (elem.checked) {
            states.setAreTopicsCol(true);
        }
        else {
            states.setAreTopicsCol(false);
        }
    });
    var conteneur = document.getElementsByClassName('conteneur-topic-pagi')[0];
    conteneur.addEventListener("mouseenter", function(e) {
        states.setIsHoverCursor(true);
    }, false);
    conteneur.addEventListener("mouseleave", function(e) {
        states.setIsHoverCursor(false);
    }, false);
    refreshTrend();
}
// START
window.onload = function() {
    initUI();
    initCSS();
    var cptPage = 1;
    var cptTrend = 1;
    var refrTrend = refreshTrend;
    var procHover = processHover;
    var procNotHover = processNotHover;
    setInterval(function() {
        if (cptTrend < timerRefreshTrend) { cptTrend++; }
        else {
            refrTrend();
            if (isHoverCursor || isHoverButton) { procHover(); }
            cptTrend = 1;
        }
        if (cptPage < timerRefreshPage) { cptPage++; }
        else {
            if (!isHoverCursor && !isHoverButton) { procNotHover(); }
            cptPage = 1;
        }
    }, 1000);
};
