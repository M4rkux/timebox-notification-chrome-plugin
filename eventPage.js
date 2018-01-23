const audioDefault = 'https://freesound.org/data/previews/109/109662_945474-lq.mp3';
const icone = 'https://cdn1.iconfinder.com/data/icons/web-essentials-circle-style/48/clock-2-512.png';
const audioTwoMinutes = 'https://soundoftext.nyc3.digitaloceanspaces.com/151285a0-ff88-11e7-b289-2f4fa9c8406d.mp3';
const audioFiveMinutes = 'http://uponto.franco.eti.br/res/sound/five.mp3';

let audioPermission = false;
let fiveMinutesPermission = false;
let newHour = null;

chrome.alarms.get('alarmReset', (response) => {
    if (!response) {
        reset();
    }
});

chrome.alarms.onAlarm.addListener((response) => {
    let alertObj = {};
    switch (response.name) {
        case 'alarmSaida':
            alertObj = {titulo: "Hora de bater o ponto!", corpo: { 
                    body: 'Lembre-se de ir embora.',
                    tag: 'saida',
                    icon: icone
                }
            };
            mostraNotificacao(alertObj);
            break;

        case 'alarmFiveMinutes':
            alertObj = {titulo: "Aviso!", corpo: {
                    body: 'Faltam 5 minutos para bater o ponto.',
                    tag: 'fiveminutes',
                    icon: icone
                }
            };
            mostraNotificacao(alertObj, true);
            break;

        case 'alarmReset':
            reset();
            break;
    }
});

chrome.storage.sync.get('audioPermission', response => {
    audioPermission = response.audioPermission;
});
chrome.storage.sync.get('fiveMinutesPermission', response => {
    fiveMinutesPermission = response.fiveMinutesPermission;
});

chrome.storage.sync.get('lastUpdate', response => {
    lastUpdate = response.lastUpdate ? response.lastUpdate : Date.now();

    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let oneDay = 1000 * 60 * 60 * 24;

    let lastUpdateDate = new Date(lastUpdate);
    let diffLastUpdate = lastUpdateDate - start;
    
    let dayLastUpdate = Math.floor(diffLastUpdate / oneDay);
    
    let diffNow = now - start;
    let dayToday = Math.floor(diffNow / oneDay);

    if (dayLastUpdate !== dayToday) {
        chrome.storage.sync.set({'newHour': null});
    }

    chrome.storage.sync.set({'lastUpdate': Date.now()});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'audioPermission':
                audioPermission = storageChange.newValue;
                break;
            case 'fiveMinutesPermission':
                fiveMinutesPermission = storageChange.newValue;
                break;
        }
    }
});

function mostraNotificacao(notificacao, fiveMinutesNotification) {
    if (Notification.permission === "granted") {
        let notification = new Notification(notificacao.titulo, notificacao.corpo);
        if (audioPermission) {
            let audio;
            if (fiveMinutesNotification) {
                audio = new Audio(audioFiveMinutes);
            } else {
                audio = new Audio(audioDefault);
            }
            audio.play();
        }
    }
}

function reset () {
    chrome.alarms.clearAll(() => {
        chrome.storage.sync.remove(['newHour', 'horaAlmoco', 'horaSaida']);
        let dateToClear = new Date().setHours(23);
        dateToClear = new Date(dateToClear).setMinutes(59);
        dateToClear = new Date(dateToClear).setSeconds(59);
        chrome.alarms.create('alarmReset', {
            when: dateToClear
        });
    });
}