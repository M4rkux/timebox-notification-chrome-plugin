const audioDefault = 'https://freesound.org/data/previews/109/109662_945474-lq.mp3';
const icone = 'https://cdn1.iconfinder.com/data/icons/web-essentials-circle-style/48/clock-2-512.png';
const audioTwoMinutes = 'https://soundoftext.nyc3.digitaloceanspaces.com/151285a0-ff88-11e7-b289-2f4fa9c8406d.mp3';

let notificouSaida = {
    name: 'notificouSaida',
    notificou: false
};
let notificouAlmoco = {
    name: 'notificouAlmoco',
    notificou: false
};
let notificouTwoMinutes = {
    name: 'notificouTwoMinutes',
    notificou: false
};
let audioPermission = false;
let twoMinutesPermission = false;
let newHour = null;

chrome.storage.sync.get('notificouSaida', response => {
    notificouSaida.notificou = response.notificouSaida;
});
chrome.storage.sync.get('notificouAlmoco', response => {
    notificouAlmoco.notificou = response.notificouAlmoco;
});
chrome.storage.sync.get('audioPermission', response => {
    audioPermission = response.audioPermission;
});
chrome.storage.sync.get('twoMinutesPermission', response => {
    twoMinutesPermission = response.twoMinutesPermission;
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
        chrome.storage.sync.set({'notificouSaida': false});
        chrome.storage.sync.set({'notificouAlmoco': false});
    }

    chrome.storage.sync.set({'lastUpdate': Date.now()});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'audioPermission':
                audioPermission = storageChange.newValue;
                break;
            case 'twoMinutesPermission':
                twoMinutesPermission = storageChange.newValue;
                break;
            case 'newHour':
                newHour = storageChange.newValue;
                break;
        }
    }
});

setInterval(function () {
    let horaAtual = new Date();
	let atual = horaAtual.getHours() + ':' + horaAtual.getMinutes();
    let saida = document.querySelector("#HoraPrevistaSaida").value ? document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[0] + ':' + document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[1] : '';
    let timeToLeave = newHour ? newHour : saida;
    let twoMinutes = null;
    let almoco = '';

    if (twoMinutesPermission) {
        let twoMinutesDate = new Date(new Date(new Date().setHours(timeToLeave.split(':')[0])).setMinutes(timeToLeave.split(':')[1]));
        twoMinutesDate = new Date(twoMinutesDate.getTime() - 2*60000);
        twoMinutes = twoMinutesDate.getHours() + ':' + twoMinutesDate.getMinutes();
    }

    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
      Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            mostraNotificacao({ titulo: "Aviso!", corpo: { 
                    body: 'Você irá receber notificações quando for a hora de bater o ponto', 
                    tag: "awesome-notification",
                    icon: icone
                }
            });
        }
      });
    }

    if (document.querySelector("#hdfHoraSaidaAlmoco") && document.querySelector("#hdfHoraSaidaAlmoco").value) {
        let almocoHora = parseInt(document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[0]);
        almocoHora++;
        almoco = almocoHora.toString() + ':' + document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[1];
    }
   
    verirficaHora(almoco, atual, notificouAlmoco, {titulo: "Hora de bater o ponto!", corpo: {
            body: 'Já pode voltar a trabalhar.',
            tag: 'almoco',
            icon: icone
        }
    });

    if (twoMinutesPermission) {
        verirficaHora(twoMinutes, atual, notificouTwoMinutes, {titulo: "Aviso!", corpo: {
                body: 'Faltam 2 minutos para bater o ponto.',
                tag: 'twominutes',
                icon: icone
            }
        });
    }

    verirficaHora(timeToLeave, atual, notificouSaida, {titulo: "Hora de bater o ponto!", corpo: { 
            body: 'Lembre-se de ir embora.',
            tag: 'saida',
            icon: icone
        }
    });
}, 1000);

function verirficaHora(prevista, atual, notificouObj, notificacao) {
    if (prevista === atual && !notificouObj.notificou) {
        if (!("Notification" in window)) {
          alert("Este browser não suporta notificações");
        }
        mostraNotificacao(notificacao);
        notificouObj.notificou = true;
        switch (notificouObj.name) {
            case 'notificouSaida': 
                chrome.storage.sync.set({'notificouSaida': notificouObj.notificou});
                break;
            case 'notificouAlmoco': 
                chrome.storage.sync.set({'notificouAlmoco': notificouObj.notificou});
                break;
        }
        
    }
}

function mostraNotificacao(notificacao, twoMinutesNotification) {
    if (Notification.permission === "granted") {
        let notification = new Notification(notificacao.titulo, notificacao.corpo);
        if (audioPermission) {
            let audio;
            if (twoMinutesNotification) {
                audio = new Audio(audioDefault);
            } else {
                audio = new Audio(audioTwoMinutes);
            }
            audio.play();
        }
    }
}