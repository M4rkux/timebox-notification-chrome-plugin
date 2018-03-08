const audioDefault = '/assets/audio-ponto.mp3';
const audioFiveMinutes = '/assets/five-minutes-remaining.mp3';
const icone = '/assets/relogio-notification.png';
const CINCO_MINUTOS = 5*60000;
const UM_MINUTO = 1*60000;

let audioPermission = false;
let fiveMinutesPermission = false;
let newHour = null;
const manifest = chrome.runtime.getManifest();
const devMode = manifest.name.indexOf('[Dev]') > -1;

chrome.alarms.get('alarmReset', (response) => {
    if (!response) {
        reset();
    }
});

chrome.alarms.onAlarm.addListener((response) => {
    let alertObj = {};
    switch (response.name) {
        case 'alarmAlmoco':
            alertObj = {titulo: "Hora de bater o ponto!" + (devMode ? " [Dev]" : ""), corpo: { 
                    body: 'Já pode voltar a trabalhar',
                    tag: 'almoco' + (devMode ? "-dev" : ""),
                    icon: icone
                }
            };
            mostraNotificacao(alertObj);
            break;

        case 'alarmSaida':
            alertObj = {titulo: "Hora de bater o ponto!" + (devMode ? " [Dev]" : ""), corpo: { 
                    body: 'Lembre-se de ir embora.',
                    tag: 'saida' + (devMode ? "-dev" : ""),
                    icon: icone
                }
            };
            mostraNotificacao(alertObj);
            break;

        case 'alarmFiveMinutes':
            alertObj = {titulo: "Aviso!" + (devMode ? " [Dev]" : ""), corpo: {
                    body: 'Faltam 5 minutos para bater o ponto.',
                    tag: 'fiveminutes' + (devMode ? "-dev" : ""),
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

chrome.storage.sync.get('newHour', response => {
    newHour = response.newHour;
});

chrome.storage.onChanged.addListener(function(changes) {
    let horaAtual = new Date().getTime();
    for (let key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'audioPermission':
                audioPermission = storageChange.newValue;
                break;

            case 'fiveMinutesPermission':
                fiveMinutesPermission = storageChange.newValue;
                chrome.alarms.get('alarmSaida', (response) => {
                    if (!!fiveMinutesPermission && !!response && horaAtual <= (response.scheduledTime - CINCO_MINUTOS)) {
                        makeFiveMinutesAlert(response.scheduledTime);
                    } else {
                        chrome.alarms.clear('alarmFiveMinutes', () => {
                            chrome.storage.sync.set({'checkAlarms' : true});
                        });
                    }
                });
                break;

            case 'horaSaida':
                if (!newHour) {
                    let horaSaida = storageChange.newValue;
                    chrome.alarms.clear('alarmSaida', () =>{
                        chrome.alarms.create('alarmSaida', {
                            when: horaSaida
                        });
                        chrome.storage.sync.set({'checkAlarms' : true});
                    });
                    if (fiveMinutesPermission && horaAtual <= (horaSaida - CINCO_MINUTOS)) {
                        makeFiveMinutesAlert(horaSaida);
                    }
                }
                break;

            case 'newHour':
                newHour = storageChange.newValue;
                if (newHour) {
                    chrome.alarms.clear('alarmSaida', () =>{
                        chrome.alarms.create('alarmSaida', {
                            when: newHour
                        });
                        chrome.storage.sync.set({'checkAlarms' : true});
                    });
                    if (fiveMinutesPermission) {
                        makeFiveMinutesAlert(newHour);
                    }
                } else {
                    chrome.storage.sync.get('horaSaida', response => {
                        horaSaida = response.horaSaida;
                        if (horaSaida) {
                            chrome.alarms.clear('alarmSaida', () =>{
                                chrome.alarms.create('alarmSaida', {
                                    when: horaSaida
                                });
                                chrome.storage.sync.set({'checkAlarms' : true});
                            });
                            if (fiveMinutesPermission) {
                                makeFiveMinutesAlert(horaSaida);
                            }
                        }
                    });
                }
                
                break;

            case 'horaAlmoco':
                let almoco = storageChange.newValue;
                chrome.alarms.clear('alarmAlmoco', () => {
                    chrome.alarms.create('alarmAlmoco', {
                        when: almoco
                    });
                    chrome.storage.sync.set({'checkAlarms' : true});
                });
                break;
        }
    }
});

function makeFiveMinutesAlert (horaSaida) {
    chrome.alarms.clear('alarmFiveMinutes', () => {
        let newDate = new Date(horaSaida - CINCO_MINUTOS).getTime()
        newDate = new Date(newDate - UM_MINUTO).getTime()
        chrome.alarms.create('alarmFiveMinutes', {
            when : newDate
        });
        chrome.storage.sync.set({'checkAlarms' : true});
    });
}

function mostraNotificacao(notificacao, fiveMinutesNotification) {
    if (Notification.permission === "granted") {
        let notification = new Notification(notificacao.titulo, notificacao.corpo);
        notification.onclick = function () {
            window.open('https://webservices.cinq.com.br/pessoas/timebox');
        }; 

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
        dateToClear = new Date(dateToClear).setMilliseconds(999);
        chrome.alarms.create('alarmReset', {
            when: dateToClear
        });
    });
}