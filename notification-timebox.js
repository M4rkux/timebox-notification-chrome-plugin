let newHour = false;
let fiveMinutesPermission = false;

chrome.storage.sync.get('newHour', response => {
    newHour = response.newHour;
});

chrome.storage.sync.get('fiveMinutesPermission', response => {
    fiveMinutesPermission = response.fiveMinutesPermission;
});

if (!newHour) {
    if (document.querySelector("#HoraPrevistaSaida").value && document.querySelector("#HoraPrevistaSaida").value.indexOf(':') > -1) {
        let horaSaida = new Date().setHours(document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[0]);
        horaSaida = new Date(horaSaida).setMinutes(document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[1]);
        horaSaida = new Date(horaSaida).setSeconds(0);
        chrome.alarms.get('alarmSaida', (response) => {
            if (!response) {
                chrome.alarms.create('alarmSaida', {
                    when: horaSaida
                });
                if (fiveMinutesPermission) {
                    chrome.alarms.clear('alarmFiveMinutes', () => {
                        chrome.alarms.create('alarmFiveMinutes', {
                            when : new Date(horaSaida - 2*60000).getTime()
                        });
                    });
                }
            }
        });
        chrome.storage.sync.set({'horaSaida': horaSaida});
    }
}

if (document.querySelector("#hdfHoraSaidaAlmoco").value && document.querySelector("#hdfHoraSaidaAlmoco").value.indexOf(':') > -1) {
    let almocoHora = parseInt(document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[0]);
    almocoHora++;
    let almoco = new Date().setHours(almocoHora);
    almoco = new Date(almoco).setMinutes(document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[1]);
    almoco = new Date(almoco).setSeconds(0);
    
    chrome.storage.sync.set({'horaAlmoco': almoco});

    chrome.alarms.get('alarmAlmoco', (response) => {
        if (!response) {
            chrome.alarms.create('alarmAlmoco', {
                when: almoco
            });
        }
    });
}