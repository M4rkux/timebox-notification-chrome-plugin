const audio = new Audio('https://freesound.org/data/previews/109/109662_945474-lq.mp3');
const icone = 'https://cdn1.iconfinder.com/data/icons/web-essentials-circle-style/48/clock-2-512.png';

let notificouSaida = { jaNotificou: document.querySelector("#HoraSaida") ? true : false };
let notificouAlmoco = { jaNotificou: document.querySelector("#hdfHoraEntradaAlmoco") ? true : false };
let audioPermission = false;
let twominutes = false;
let newHour = null;

chrome.storage.sync.get('audioPermission', response => {
    audioPermission = response.audioPermission;
});
chrome.storage.sync.get('twominutes', response => {
    twominutes = response.twominutes;
});
chrome.storage.sync.get('newHour', response => {
    newHour = response.newHour;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'audioPermission':
                audioPermission = storageChange.newValue;
                break;
            case 'twominutes':
                twominutes = storageChange.newValue;
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
    let almoco = '';

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

    verirficaHora(newHour ? newHour : saida, atual, notificouSaida, {titulo: "Hora de bater o ponto!", corpo: { 
            body: 'Lembre-se de ir embora.',
            tag: 'saida',
            icon: icone
        }
    });
}, 1000);

function verirficaHora(prevista, atual, notificou, notificacao) {
    if (prevista === atual && !notificou.jaNotificou) {
        if (!("Notification" in window)) {
          alert("Este browser não suporta notificações");
        }
        mostraNotificacao(notificacao);
        notificou.jaNotificou = true;
    }
}

function mostraNotificacao(notificacao) {
    if (Notification.permission === "granted") {
        let notification = new Notification(notificacao.titulo, notificacao.corpo);
        if (audioPermission) {
            audio.play();
        }
    }
}