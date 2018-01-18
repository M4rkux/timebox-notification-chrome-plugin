let promises = [];

promises.push(chrome.storage.sync.get('twominutes', response => {
    if (response.twominutes) {
        document.getElementById('twominutes').checked = true;
    } else {
        document.getElementById('twominutes').checked = false;
    }
}));

promises.push(chrome.storage.sync.get('audioPermission', response => {
    if (response.audioPermission) {
        document.getElementById('audioPermission').checked = true;
    } else {
        document.getElementById('audioPermission').checked = false;
    }
}));

Promise.all(promises).then((resp) => {
    document.getElementById('body').style = 'display: block';
});


document.getElementById('twominutes').addEventListener('change', saveTwoMinutes);

function saveTwoMinutes(e) {
    chrome.storage.sync.set({'twominutes': e.target.checked}, function() {
        console.log('Two Minutes ' + (e.target.checked ? 'Ativado' : 'Desativado'));
    });
}

document.getElementById('audioPermission').addEventListener('change', saveAudioPermission);

function saveAudioPermission(e) {
    chrome.storage.sync.set({'audioPermission': e.target.checked}, function() {
        console.log('Áudio ' + (e.target.checked ? 'Ativado' : 'Desativado'));
    });
}