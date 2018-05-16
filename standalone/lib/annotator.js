'use strict'

var FORMAT = '',
    FILENAME = 'ud-annotatrix-corpus.conllu', // default name
    CONTENTS = '',
    // var TEMPCONTENTS = '';
    AVAILABLE_SENTENCES = 0,
    CURRENT_SENTENCE = 0,
    RESULTS = [],
    LABELS = [];

window.onload = () => {

    /* Loads all the js libraries and project modules, then calles onReady.
    If server is running, makes a button for saving data.*/
    const path = './lib';
    head.js(
        `${path}/ext/jquery-3.2.1.min.js`,
        `${path}/ext/jquery-ui-1.12.1/jquery-ui.min.js`,
        `${path}/ext/cytoscape.min.js`,
        `${path}/ext/undomanager.js`,
        //`${path}/ext/popper.min.js`,
        `${path}/ext/jquery.autocomplete.js`,
        //`${path}/ext/bootstrap.min.js`,
        `${path}/ext/l20n.js`,
        `${path}/ext/canvas2svg.js`,
        `${path}/ext/conllu/conllu.js`, // CoNLL-U parser from https://github.com/FrancessFractal/conllu

        // native project code
        `${path}/CG2conllu.js`,
        `${path}/SD2conllu.js`,
        `${path}/Brackets2conllu.js`,
        `${path}/converters.js`,
        `${path}/server_support.js`,
        `${path}/gui.js`,
        `${path}/conllu_table.js`,
        `${path}/cy-style.js`,
        `${path}/visualiser.js`,
        `${path}/validation.js`,

        // KM classes
        `${path}/logger.js`,
        `${path}/tester.js`,
        `${path}/errors.js`
    );
    head.ready(onReady);
}


function onReady() {
    /*
    Called when all the naive code and libraries are loaded.
    - checks if server is running
    - sets undo manager
    - loads data from localStorage, if avaliable and server is not running
    - checks if someone loads data in url
    - binds handlers to DOM emements
    */

    window.log = new Logger('DEBUG');
    window.test = new Tester();
    window.test.all();
    resetCy(CY_OPTIONS); // initialize w/ defaults to avoid cy.$ is not a function errors

    checkServer(); // check if server is running
    window.undoManager = new UndoManager();  // undo support
    setUndos(window.undoManager);
    loadFromUrl();
    bindHandlers();

}


function saveData() { // TODO: rename to updateData
    log.debug(`called saveData()`);

    if (IS_SERVER_RUNNING) {
        updateOnServer()
    } else {
        localStorage.setItem('corpus', getContents()); // TODO: get rid of 'corpus', move the treebank updating here from getContents
    }
}


function getContents() {
    log.debug(`called getContents()`);

    /* Gets the corpus data saving the changes in current sentence,
    dependlessly of whether it's on server or in localStorage. */

    /* if (IS_SERVER_RUNNING) {
        // TODO: implement different functionality here
    } else { */

        let splitted = localStorage.getItem('treebank'); // TODO: implement a more memory-friendly func?
        splitted = JSON.parse(splitted) || new Array(); // string to array
        splitted[CURRENT_SENTENCE] = $('#indata').val();
        localStorage.setItem('treebank', JSON.stringify(splitted)); // update the treebank
        return splitted.join('\n\n');
    /* } */
}


function loadFromLocalStorage() {
    log.debug(`called loadFromLocalStorage()`);

    /* Checks if localStorage is avaliable. If yes, tries to load the corpus
    from localStorage. If no, warn user that localStorage is not avaliable. */

    if (storageAvailable('localStorage')) {

        const localStorageMaxSize = getLocalStorageMaxSize();
        $('#localStorageAvailable').text(`${localStorageMaxSize/1024}k`);
        if (localStorage.getItem('corpus') !== null) {
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        }

    }
    else {

        log.warn('localStorage is not available :(');

        // add a nice message so the user has some idea how to fix this.
        $('#warning').append(
            $('<p>Unable to save to localStorage, maybe third-party cookies are blocked?</p>') );

    }
}



function loadFromUrl() {
    log.debug(`called loadFromUrl`);

    /* Check if the URL contains arguments. If it does, takes first
    and writes it to the textbox. */

    let parameters = window.location.search.slice(1);
    if (parameters) {
        parameters = parameters.split('&');
        const variables = parameters.map( (arg) => {
            return arg.split('=')[1].replace(/\+/g, ' ');
        });

        $('#indata').val(variables);
        drawTree();
    }
}


function loadFromFile(e) {
    log.debug(`called loadFromFile(${JSON.stringify(e)})`);

    /*
    Loads a corpus from a file from the user's computer,
    puts the filename into localStorage.
    If the server is running, ... TODO
    Else, loads the corpus to localStorage.
    */

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    localStorage.setItem('filename', file.name);

    reader.onload = (e) => {
        if (IS_SERVER_RUNNING) {
            // TODO: do something
        } else {
            localStorage.setItem('corpus', e.target.result);
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        }
    }
    reader.readAsText(file);
}


function formatUploadSize(fileSize) {
    log.debug(`called formatUploadSize(${fileSize})`);

    if (fileSize < 1024)
        return `${fileSize} B`;
    if (fileSize < 1048576)
        return `${(fileSize/1024).toFixed(1)} kB`;

    return `${(fileSize/1048576).toFixed(1)} mB`;
}

function isQuotaExceeded(e) {
    log.debug(`called isQuotaExceeded(${JSON.stringify(e)})`);

    let quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014: // Firefox
                    quotaExceeded = (e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
                    break;
            }
        } else {
            quotaExceeded = (e.number === -2147024882) // IE8
        }
    }

    return quotaExceeded;
}

function handleUploadButtonPressed() {
    log.debug(`called handleUploadButtonPressed()`);

    throw new NotImplementedError('handle upload button not implemented');
    /*
    // Replaces current content
    CONTENTS = TEMPCONTENTS;
    localStorage.setItem('corpus', CONTENTS);
    getLocalStorageMaxSize()
    $('#localStorageAvailable').text(LOCALSTORAGE_AVAILABLE / 1024 + 'k');
    loadDataInIndex();
    $('#uploadFileButton').attr('disabled', 'disabled');
    $('#uploadFileSizeError').hide();
    $('#fileModal').modal('hide');*/
}


function addSent() { // TODO: this is probably not what we want? what if we turn it into 'insert a new sentence _here_'?
    log.debug(`called addSent()`);
    AVAILABLE_SENTENCES += 1;
    showDataIndiv();
}

function removeCurSent() {
    log.debug(`called removeCurSent()`);

    /* Called when the button 'remove sentence' is pressed.
    Calls confirm window. If affirmed, */
    const conf = confirm('Do you want to remove the sentence?');
    if (conf) {
        saveData();
        const realCurrentSentence = CURRENT_SENTENCE; // это нужно, т.к. в loadDataInIndex всё переназначается. это как-то мега костыльно, и надо исправить.
        $('#indata').val('');
        localStorage.setItem('corpus', getContents());
        loadDataInIndex();
        CURRENT_SENTENCE = realCurrentSentence;
        if (CURRENT_SENTENCE >= AVAILABLE_SENTENCES)
            CURRENT_SENTENCE--;

        showDataIndiv();
    }
}


function loadDataInIndex() {
    log.debug(`called loadDataInIndex`);

    RESULTS = [];
    AVAILABLE_SENTENCES = 0;
    CURRENT_SENTENCE = 0;


    const corpus = localStorage.getItem('corpus');
    const splitted = splitIntoSentences(corpus);
    localStorage.setItem('treebank', JSON.stringify(splitted));
    RESULTS = splitted; // TODO: get rid of RESULTS

    AVAILABLE_SENTENCES = splitted.length;
    $('#nextSenBtn').prop('disabled', (AVAILABLE_SENTENCES < 2));

    showDataIndiv();
}


function splitIntoSentences(corpus) {
    log.debug(`called splitIntoSentences(<Corpus>)`);

    /* Takes a string with the corpus and returns an array of sentences. */
    const format = detectFormat(corpus);

    // splitting
    let splitted;
    if (format === 'plain text') {
        splitted = corpus.match(/[^ ].+?[.!?](?=( |$))/g);
    } else {
        splitted = corpus.split('\n\n');
    }

    // removing empty lines
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }

    log.debug(`splitIntoSentences(): splitted: ${JSON.stringify(splitted)}`);
    return splitted;
}


function showDataIndiv() {
    log.debug(`called showDataIndiv()`);

    /* This function is called each time the current sentence is changed
    to update the CoNLL-U in the textarea and the indices. */

    $('#indata').val(RESULTS[CURRENT_SENTENCE] || '');
    $('#currentsen').val(AVAILABLE_SENTENCES === 0 ? 0 : CURRENT_SENTENCE + 1);
    $('#totalsen').val(AVAILABLE_SENTENCES);

    updateTable(); // Update the table view at the same time
    formatTabsView($('#indata')); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}


function goToSenSent() {
    log.debug(`called goToSenSent()`);

    saveData();

    RESULTS[CURRENT_SENTENCE] = $('#indata').val();
    CURRENT_SENTENCE = parseInt($('#currentsen').val()) - 1;

    if (CURRENT_SENTENCE < 0)
        CURRENT_SENTENCE = 0;

    if (CURRENT_SENTENCE > (AVAILABLE_SENTENCES - 1))
        CURRENT_SENTENCE = AVAILABLE_SENTENCES - 1;

    $('#nextSenBtn').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#prevSenBtn').prop('disbaled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}

function prevSenSent() {
    log.debug(`called prevSenSent()`);

    saveData();

    RESULTS[CURRENT_SENTENCE] = $('#indata').val();
    CURRENT_SENTENCE--;

    if (CURRENT_SENTENCE < 0)
        CURRENT_SENTENCE = 0;

    $('#nextSenBtn').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#prevSenBtn').prop('disbaled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}

function nextSenSent() {
    log.debug(`called nextSenSent()`);

    /* When the user navigates to the next sentence. */
    saveData();

    RESULTS[CURRENT_SENTENCE] = $('#indata').val();
    CURRENT_SENTENCE++;

    if (CURRENT_SENTENCE >= AVAILABLE_SENTENCES)
        CURRENT_SENTENCE = AVAILABLE_SENTENCES;

    $('#nextSenBtn').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#prevSenBtn').prop('disbaled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}

function clearLabels() {
    log.debug(`called clearLabels()`);

    LABELS = [];
    $('#treeLabels').children().detach();
}

function exportCorpora() {
    log.debug(`called exportCorpora()`);

    //Export Corpora to file
    if (IS_SERVER_RUNNING) {
        downloadCorpus();
    } else {

        const link = $('<a>')
            .attr('download', localStorage.getItem('filename') || 'ud-annotatrix-corpus.conllu')
            .attr('href', `data:text/plain; charset=utf-8,${encodeURIComponent(getContents())}`);
        $('body').append(link);
        link[0].click();

    }
}


function clearCorpus() {
    log.debug(`called clearCorpus()`);

    /* Removes all the corpus data from CONTENTS and localStorage,
    clears all the ralated global variables. */
    CONTENTS = '';
    AVAILABLE_SENTENCES = 0;
    CURRENT_SENTENCE = 0;
    RESULTS = [];
    FORMAT = '';
    localStorage.setItem('corpus', '');
    $('#indata').val('');
    showDataIndiv()
    window.location.reload();
    drawTree();
}


function drawTree() {
    log.debug(`called drawTree()`);

    /* This function is called whenever the input area changes.
    1. removes the previous tree, if there's one
    2. takes the data from the textarea
    3. */

    IS_EDITING = false;

    // TODO: update the sentence
    try {
        cy.destroy(); // remove the previous tree if there is one
    } catch (e) {
        log.warn(`drawTree(): Error while destroying cy: ${e.message}`);
    }

    let content = $('#indata').val(); // TODO: rename
    const format = detectFormat(content);

    // -- to be moved out--
    // content = content.replace(/ +\n/, '\n'); // remove extra spaces at the end of lines. #89
    // $('#indata').val(content); // TODO: what is this line for?

    // $('#detected').html('Detected: ' + format + ' format');
    // to be moved out --

    switch (format) {
        case ('CG3'):
            content = CG2conllu(content);
            if (content === undefined) { // ambiguous CG3
                cantConvertCG(); // show warning
                return; // leave
            } else {
                clearWarning();
            }
            break;
        case ('SD'):
            content = SD2conllu(content);
            break;
        case ('Brackets'):
            content = Brackets2conllu(content);
            break;
        case ('plain text'):
        case ('Unknown'):
            return; // if here, the format wasn't yet converted to a format with a graph repr
        default:
            log.warn(`drawTree(): Unrecognized format: ${format}`);
            break;
    }

    content = cleanConllu(content);

    conlluDraw(content);
    showProgress();
    const inpSupport = $('<div id="mute"><input type="text" id="edit" class="hidden-input"/></div>');
    $('#cy').prepend(inpSupport);
    bindCyHandlers(); // moved to gui.js
    saveData();
    return content;
}


function formatTabsView() {
    log.debug(`called formatTabsView`);

    /* The function handles the format tabs above the textarea.
    Takes a string with a format name, changes the classes on tabs. */
    const format = detectFormat($('#indata').val());
    if (format === 'CoNLL-U') {
        $('#viewOther').hide().removeClass('active');
        $('#viewCG').removeClass('active');
        $('#viewConllu').addClass('active');
    } else if (format === 'CG3') {
        $('#viewOther').hide().removeClass('active');
        $('#viewCG').addClass('active');
        $('#viewConllu').removeClass('active');
    } else {
        $('#viewOther').show().addClass('active').text(format);
        $('#viewCG').removeClass('active');
        $('#viewConllu').removeClass('active');
    }
}


function detectFormat(content) {
    log.debug(`called detectFormat(<content>)`);

    // TODO: too many 'hacks' and presuppositions. refactor.
    // returns one of [ 'Unknown', 'CG3', 'CoNLL-U', 'SD', 'Brackets', 'plain text' ]
    clearLabels();

    content = content.trim();

    if (content == '') {
        log.warn('detectFormat(): received empty content');
        return 'Unknown';
    }

    var firstWord = content.replace(/\n/g, ' ').split(' ')[0];

    //console.log('[0] detectFormat() ' + content.length + ' | ' + FORMAT);
    //console.log('[1] detectFormat() ' + content);

    // handling # comments at the beginning
    if (firstWord[0] === '#'){
        var following = 1;
        while (firstWord[0] === '#' && following < content.length){
            // TODO: apparently we need to log the thing or it won't register???
            firstWord = content.split('\n')[following];
            // pull out labels and put them in HTML, TODO: this probably
            // wants to go somewhere else.
            if (firstWord.search('# labels') >= 0) {
                var labels = firstWord.split('=')[1].split(' ');
                for(var i = 0; i < labels.length; i++) {
                    var seen = false;
                    for(var j = 0; j < LABELS.length; j++) {
                        if (labels[i] == LABELS[j]) {
                            seen = true;
                        }
                    }
                    if (!seen) {
                        LABELS.push(labels[i]);
                    }
                }
                var htmlLabels = $('#treeLabels');
                for(var k = 0; k < LABELS.length; k++) {
                    if (LABELS[k].trim() == '') {
                        continue;
                    }
                    htmlLabels.append($('<span></span>')
                        .addClass('treebankLabel')
                        .text(LABELS[k])
                    );
                }
                //console.log('FOUND LABELS:' + LABELS);
            }
            following ++;
        }
    }

    var trimmedContent = content.trim('\n');
    //console.log(trimmedContent + ' | ' + trimmedContent[trimmedContent.length-1]);
    if (firstWord.match(/'<.*/)) {
    // SAFE: The first token in the string should start with '<
        FORMAT = 'CG3';
    } else if (firstWord.match(/1/)) {
    // UNSAFE: The first token in the string should be 1
        FORMAT = 'CoNLL-U';
    } else if (trimmedContent.includes('(') && trimmedContent.includes('\n') && (trimmedContent.includes(')\n') || trimmedContent[trimmedContent.length-1] == ')')) {
    // SAFE: To be SDParse as opposed to plain text we need at least 2 lines.
    // UNSAFE: SDParse should include at least one line ending in ) followed by a newline
    // UNSAFE: The last character in the string should be a )
        FORMAT = 'SD';
    // UNSAFE: The first character is an open square bracket
    } else if (firstWord.match(/\[/)) {
                FORMAT = 'Brackets';
    // TODO: better plaintext recognition
    } else if (!trimmedContent.includes('\t') && trimmedContent[trimmedContent.length-1] != ')') {
    // SAFE: Plain text and SDParse should not include tabs. CG3/CoNLL-U should include tabs
    // UNSAFE: SDParse should end the line with a ), but plain text conceivably could too
        FORMAT = 'plain text';
    } else {
        FORMAT = 'Unknown';
    }
    //console.log('[3] detectFormat() ' + FORMAT);

    return FORMAT
}


function showHelp() {
    log.debug(`called showHelp()`);

    /* Opens help in new tab. */
    window.open('help.html', '_blank').focus();
}


function storageAvailable(type) {
    log.debug(`called storageAvailable(${type})`);

    /* Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API */
    try {
        const storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException
            && ( e.code === 1014 // Firefox
                || e.code === 22 // everything else
                // test name field too, because code might not be present
                || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox
                || e.name === 'QuotaExceededError' )       // everything else

            // acknowledge QuotaExceededError only if there's something already stored
            && storage.length !== 0;
    }
}



function getLocalStorageMaxSize(error) {
    log.debug(`called getLocalStorageMaxSize(${error})`);

    /* Returns the remaining available space in localStorage */

    const max = 10 * 1024 * 1024,
        testKey = `size-test-${Math.random().toString()}`; // generate random key
    let i = 64,
        string1024 = '',
        string = '',
        found = 0;

    if (localStorage) {

        error = error || 25e4;

        // fill a string with 1024 symbols/bytes
        while (i--) string1024 += 1e16

        // fill a string with "max" amount of symbols/bytes
        i = max/1024;
        while (i--) string += string1024;
        i = max;

        // binary search
        while (i > 1) {
            try {
                localStorage.setItem(testKey, string.substr(0, i));
                localStorage.removeItem(testKey);

                if (found < i - error) {
                    found = i;
                    i *= 1.5;
                } else {
                  break;
                }

            } catch (e) {
                localStorage.removeItem(testKey);
                i = found + (i - found) / 2;
            }
        }
    }
    return found;
}
