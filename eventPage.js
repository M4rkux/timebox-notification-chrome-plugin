const audioDefault = '/assets/audio-ponto.mp3';
const icone = '/assets/relogio-notification.png';
const audioTwoMinutes = 'https://soundoftext.nyc3.digitaloceanspaces.com/151285a0-ff88-11e7-b289-2f4fa9c8406d.mp3';
const audioFiveMinutes = '/assets/five-minutes-remaining.mp3';

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
        case 'alarmAlmoco':
            alertObj = {titulo: "Hora de bater o ponto!", corpo: { 
                    body: 'Já pode voltar a trabalhar',
                    tag: 'almoco',
                    icon: icone
                }
            };
            mostraNotificacao(alertObj);
            break;

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

chrome.storage.sync.get('newHour', response => {
    newHour = response.newHour;
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
                if (fiveMinutesPermission) {
                    chrome.alarms.get('alarmSaida', (response) => {
                        if (!!response) {
                            chrome.alarms.clear('alarmFiveMinutes', () => {
                                chrome.alarms.create('alarmFiveMinutes', {
                                    when : new Date(response.scheduledTime - 2*60000).getTime()
                                });
                            });
                        }
                    });
                } else {
                    chrome.alarms.clear('alarmFiveMinutes');
                }
                break;

            case 'horaSaida':
                if (!newHour) {
                    let horaSaida = storageChange.newValue;
                    chrome.alarms.clear('alarmSaida', () =>{
                        chrome.alarms.create('alarmSaida', {
                            when: horaSaida
                        });
                    });
                    if (fiveMinutesPermission) {
                        chrome.alarms.clear('alarmFiveMinutes', () => {
                            chrome.alarms.create('alarmFiveMinutes', {
                                when : new Date(horaSaida - 2*60000).getTime()
                            });
                        });
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
                    });
                    if (fiveMinutesPermission) {
                        chrome.alarms.clear('alarmFiveMinutes', () => {
                            chrome.alarms.create('alarmFiveMinutes', {
                                when : new Date(newHour - 2*60000).getTime()
                            });
                        });
                    }
                } else {
                    chrome.storage.sync.get('horaSaida', response => {
                        horaSaida = response.horaSaida;
                        chrome.alarms.clear('alarmSaida', () =>{
                            chrome.alarms.create('alarmSaida', {
                                when: horaSaida
                            });
                        });
                        if (fiveMinutesPermission) {
                            chrome.alarms.clear('alarmFiveMinutes', () => {
                                chrome.alarms.create('alarmFiveMinutes', {
                                    when : new Date(horaSaida - 2*60000).getTime()
                                });
                            });
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
                });
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