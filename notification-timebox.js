const UM_MINUTO = 1*60000;

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#HoraPrevistaSaida") && 
        document.querySelector("#HoraPrevistaSaida").value && 
        document.querySelector("#HoraPrevistaSaida").value.indexOf(':') > -1 &&
        !document.querySelector("#botaoPonto_4 .pontoalign label")) {

        let horaSaida = new Date().setHours(document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[0]);
        horaSaida = new Date(horaSaida).setMinutes(document.querySelector("#HoraPrevistaSaida").value.split(' ')[1].split(':')[1]);
        horaSaida = new Date(horaSaida).setSeconds(0);
        horaSaida = new Date(horaSaida).setMilliseconds(0);
        horaSaida = new Date(horaSaida - UM_MINUTO).getTime();
        
        chrome.storage.sync.get('horaSaida', (response) => {
            if (!response.horaSaida || horaSaida !== response.horaSaida) {
                chrome.storage.sync.set({'horaSaida': horaSaida});
            }
        });
    }
    
    if (document.querySelector("#hdfHoraSaidaAlmoco") && 
        document.querySelector("#hdfHoraSaidaAlmoco").value && 
        document.querySelector("#hdfHoraSaidaAlmoco").value.indexOf(':') > -1 && 
        (!document.querySelector('#hdfHoraEntradaAlmoco') || !document.querySelector('#hdfHoraEntradaAlmoco').value)) {

        let almocoHora = parseInt(document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[0]);
        almocoHora++;
        let almoco = new Date().setHours(almocoHora);
        almoco = new Date(almoco).setMinutes(document.querySelector("#hdfHoraSaidaAlmoco").value.split(':')[1]);
        almoco = new Date(almoco).setSeconds(0);
        almoco = new Date(almoco).setMilliseconds(0);
        almoco = new Date(almoco - UM_MINUTO).getTime();
        
        chrome.storage.sync.set({'horaAlmoco': almoco});
    }
});
    