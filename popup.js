let promises = [];

promises.push(chrome.storage.sync.get('fiveMinutesPermission', response => {
    if (response.fiveMinutesPermission) {
        document.getElementById('fiveMinutesPermission').checked = true;
    } else {
        document.getElementById('fiveMinutesPermission').checked = false;
    }
}));

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

/* FUNÇÃO PARA SALVAR O AVISO DE 5 MINUTOS */
document.getElementById('fiveMinutesPermission').addEventListener('change', saveFiveMinutes);

function saveFiveMinutes(e) {
    chrome.storage.sync.set({'fiveMinutesPermission': e.target.checked}, () => {
        console.log('Five Minutes ' + (e.target.checked ? 'Ativado' : 'Desativado'));
    });
}

/* FUNÇÃO PARA SALVAR A PERMISSÃO DE ÁUDIO */
document.getElementById('audioPermission').addEventListener('change', saveAudioPermission);

function saveAudioPermission(e) {
    chrome.storage.sync.set({'audioPermission': e.target.checked}, () => {
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
        removeNewHour();
    }
}

function overwriteHour(e) {
    if (document.getElementById('hourOverwited').value) {
        chrome.storage.sync.set({'newHour': document.getElementById('hourOverwited').value}, () => {
            console.log('Notificação da hora de saída sobrescrita para ' + document.getElementById('hourOverwited').value);
            let newHour = new Date().setHours(document.getElementById('hourOverwited').value.split(':')[0]);
            newHour = new Date(newHour).setMinutes(document.getElementById('hourOverwited').value.split(':')[1]);
            newHour = new Date(newHour).setSeconds(0);

            chrome.alarms.clear('alarmSaida', () => {
                chrome.alarms.create('alarmSaida', {
                    when: newHour
                });
            });
            if (fiveMinutesPermission) {
                chrome.alarms.clear('alarmFiveMinutes', () => {
                    chrome.alarms.create('alarmFiveMinutes', {
                        when : new Date(newHour - 2*60000).getTime()
                    });
                });
            }
        });
    } else {
        removeNewHour();
    }
}

function removeNewHour() {
    chrome.storage.sync.remove('newHour', () => {
        console.log('Notificação da hora de saída voltou para o padrão');
        chrome.alarms.clear('alarmSaida');
        chrome.alarms.clear('alarmFiveMinutes', () => {
            chrome.storage.sync.get('horaSaida', (response) => {
                if (response.horaSaida) {
                    chrome.alarms.create('alarmSaida', {
                        when: horaSaida
                    });
                    chrome.alarms.create('alarmFiveMinutes', {
                        when : new Date(horaSaida - 2*60000).getTime()
                    });
                }
            });
        });
    });
}