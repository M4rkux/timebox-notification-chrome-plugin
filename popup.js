let promises = [];

// promises.push(chrome.storage.sync.get('twominutes', response => {
//     if (response.twominutes) {
//         document.getElementById('twominutes').checked = true;
//     } else {
//         document.getElementById('twominutes').checked = false;
//     }
// }));

promises.push(chrome.storage.sync.get('audioPermission', response => {
    if (response.audioPermission) {
        document.getElementById('audioPermission').checked = true;
    } else {
        document.getElementById('audioPermission').checked = false;
    }
}));

promises.push(chrome.storage.sync.get('newHour', response => {
    if (response.newHour) {
        document.getElementById('overwriteHour').checked = true;
        document.getElementById('hourOverwited').disabled = false;
        document.getElementById('hourOverwited').value = response.newHour;
    } else {
        document.getElementById('overwriteHour').checked = false;
        document.getElementById('hourOverwited').disabled = true;
    }
}));

Promise.all(promises).then((resp) => {
    document.getElementById('body').style = 'display: block';
});

/* FUNÇÃO PARA SALVAR O AVISO DE 2 MINUTOS */
// document.getElementById('twominutes').addEventListener('change', saveTwoMinutes);

// function saveTwoMinutes(e) {
//     chrome.storage.sync.set({'twominutes': e.target.checked}, function() {
//         console.log('Two Minutes ' + (e.target.checked ? 'Ativado' : 'Desativado'));
//     });
// }

/* FUNÇÃO PARA SALVAR A PERMISSÃO DE ÁUDIO */
document.getElementById('audioPermission').addEventListener('change', saveAudioPermission);

function saveAudioPermission(e) {
    chrome.storage.sync.set({'audioPermission': e.target.checked}, function() {
        console.log('Áudio ' + (e.target.checked ? 'Ativado' : 'Desativado'));
    });
}

/* FUNÇÃO PARA SALVAR QUE O USUÁRIO DESEJA SOBRESCREVER A HORA AUTOMÁTICA */
document.getElementById('overwriteHour').addEventListener('change', toggleOverwriteHour);
document.getElementById('hourOverwited').addEventListener('change', overwriteHour);

function toggleOverwriteHour(e) {
    if (e.target.checked) {
        document.getElementById('hourOverwited').disabled = false;
    } else {
        document.getElementById('hourOverwited').disabled = true;
        document.getElementById('hourOverwited').value = null;
    }
}

function overwriteHour(e) {
    if (document.getElementById('overwriteHour')) {
        chrome.storage.sync.set({'newHour': document.getElementById('hourOverwited').value}, function() {
            console.log('Notificação da hora de saída sobrescrita para ' + document.getElementById('hourOverwited').value);
        });
    } else {
        chrome.storage.sync.set({'newHour': null}, function() {
            console.log('Notificação da hora de saída voltou para o padrão');
        });
    }
    
}