let senhaCorreta = gerarSenha();
let tentativa = "";
let tentativasRestantes = 5;
let tempoRestante = 120;
let intervalo;
let posicoesFixas = [null, null, null, null];
let dificuldadeSelecionada= 'facil';
let audioAtual = null;

const audios = [
  new Audio('audios/audio_iniciovozbomb.mp3'),// inicio
  new Audio('audios/audio_bombnivel1.mp3'),
  new Audio('audios/audio_bombnivel2.mp3'),
  new Audio('audios/audio_bombnivel3.mp3'),
  new Audio('audios/audio_bombnivel4.mp3'),
  new Audio('audios/audio_bombnivel5.mp3'),
  new Audio('audios/Efeito Sonoro Explosão(MP3_160K).mp3') // final
];

audios[1].loop = true;
audios[2].loop = true;
audios[3].loop = true;
audios[4].loop = true;
audios[5].loop = true;

function tocarAudio(indice) {
  if (audioAtual !== audios[indice]) {
    if (audioAtual) {
      audioAtual.pause();
      audioAtual.currentTime = 0;
    }
    audioAtual = audios[indice];
    audioAtual.play();
  }
}

function iniciarJogo() {
  dificuldadeSelecionada = document.getElementById('dificuldade').value;

  switch (dificuldadeSelecionada) {
    case 'facil':
      tempoRestante = 120;
      tentativasRestantes = 5;
      break;
      case 'medio':
        tempoRestante = 60;
        tentativasRestantes = 5;
        break;
        case 'dificil':
          tempoRestante = 30;
          tentativasRestantes = 3;
          break;
  }
  document.getElementById('telaInicial').style.display = 'none';
  document.getElementById('jogo').style.display = 'flex';
  iniciarTimer();
  tocarAudio(0); //tocar audio de inicio
  setTimeout(() => tocarAudio(1), 2000); //tocar audio de nivel 1
  criarBotoesNumericos();
}

function gerarSenha() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function criarBotoesNumericos() {
  const painel = document.getElementById('painel');
  painel.innerHTML = "";
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.id = `btn-${i}`;
    btn.onclick = () => adicionarNumero(i);
    painel.appendChild(btn);
  }
}

function adicionarNumero(num) {
  if (tentativa.length + posicoesFixas.filter(v => v !== null).length < 4) {
    tentativa += num;
    atualizarEntrada();
  }
}

function atualizarEntrada() {
  let entrada = "";
  let tIndex = 0;
  for (let i = 0; i < 4; i++) {
    entrada += posicoesFixas[i] !== null ? posicoesFixas[i] : (tentativa[tIndex++] || "_");
  }
  document.getElementById('entrada').innerText = entrada;
}

function tentarSenha() {
  if ((tentativa.length + posicoesFixas.filter(v => v !== null).length) !== 4) {
    mostrarMensagem("Digite uma senha de 4 dígitos.", "orange");
    return;
  }

  let senhaTentada = "";
  let tIndex = 0;
  for (let i = 0; i < 4; i++) {
    senhaTentada += posicoesFixas[i] !== null ? posicoesFixas[i] : tentativa[tIndex++];
  }

  verificarCoresDosBotoes(senhaTentada);
  adicionarAoHistorico(senhaTentada);

  if (senhaTentada === senhaCorreta) {
    mostrarMensagem("Bomba desarmada com sucesso!", "lightgreen");
    clearInterval(intervalo);
    document.getElementById('resetBtn').style.display = 'block';
  } else {
    tentativasRestantes--;
    
    // atualiza audio com base nas tentativs restantes
    if (tentativasRestantes === 4) tocarAudio(2); // nivel 2
    if (tentativasRestantes === 3) tocarAudio(3); // nivel 3
    if (tentativasRestantes === 2) tocarAudio(4); // nivel 4
    if (tentativasRestantes === 1) tocarAudio(5); // nivel 5
    if (tentativasRestantes === 0) tocarAudio(6); // final;

    if (tentativasRestantes <= 0) {
      mostrarMensagem("A bomba explodiu! Você perdeu.", "red");
      clearInterval(intervalo);
      animarExplosao();
      document.getElementById('resetBtn').style.display = 'block';
    } else {
      mostrarMensagem(`Senha incorreta. Tentativas restantes: ${tentativasRestantes}`, "yellow");
      tentativa = "";
      atualizarEntrada();
    }
  }
}

function verificarCoresDosBotoes(senhaTentada) {
  const senhaArray = senhaCorreta.split('');
  const tentativaArray = senhaTentada.split('');

  tentativaArray.forEach((digito, index) => {
    const btn = document.getElementById(`btn-${digito}`);
    if (!btn) return;
    if (senhaArray[index] === digito) {
      btn.style.backgroundColor = "green";
      posicoesFixas[index] = digito;
    } else if (senhaArray.includes(digito)) {
      if (btn.style.backgroundColor !== "green") {
        btn.style.backgroundColor = "orange";
      }
    } else {
      btn.style.backgroundColor = "red";
      btn.disabled = true;
    }
  });
}

function adicionarAoHistorico(senhaTentada) {
  const container = document.getElementById('historico');
  const senhaArray = senhaCorreta.split('');
  const tentativaArray = senhaTentada.split('');
  const linha = document.createElement('div');
  linha.className = 'linha-historico';
  tentativaArray.forEach((digito, i) => {
    const span = document.createElement('span');
    span.textContent = digito;
    if (senhaArray[i] === digito) {
      span.style.color = 'lightgreen';
    } else if (senhaArray.includes(digito)) {
      span.style.color = 'orange';
    } else {
      span.style.color = 'red';
    }
    linha.appendChild(span);
  });
  container.appendChild(linha);
}

function mostrarMensagem(msg, cor) {
  const mensagem = document.getElementById('mensagem');
  mensagem.innerText = msg;
  mensagem.style.color = cor;
}

function iniciarTimer() {
  intervalo = setInterval(() => {
    tempoRestante--;
    const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, '0');
    const segundos = String(tempoRestante % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${minutos}:${segundos}`;

    //lógica para mudar o áudio conforme o tempo
    if (tempoRestante <= 96 || tentativasRestantes <= 4) {
      tocarAudio(2); // nível 2
    }
    if (tempoRestante <= 72 || tentativasRestantes <= 3) {
      tocarAudio(3); // nível 3
    }
    if (tempoRestante <= 49 || tentativasRestantes <= 2) {
      tocarAudio(4); // nível 4
    }
    if (tempoRestante <= 25 || tentativasRestantes <= 1) {
      tocarAudio(5); // nível 5
    }

    if (tempoRestante <= 0) {
      clearInterval(intervalo);
      tocarAudio(6); // explosão final
      mostrarMensagem("Tempo esgotado! A bomba explodiu!", "red");
      animarExplosao();
      document.getElementById('resetBtn').style.display = 'block';
    }
  }, 1000);
}

function animarExplosao() {
  const audio = document.getElementById('explosaoAudio');
  audio.play();
  const jogo = document.getElementById('jogo');
  jogo.classList.add('blur');
  const cores = ["#ff0000", "#ffaa00", "#ffcc00", "#ffffff"];
  let i = 0;
  const explosao = setInterval(() => {
    document.body.style.backgroundColor = cores[i % cores.length];
    i++;
    if (i > 8) {
      clearInterval(explosao);
      document.body.style.backgroundColor = "#111";
      jogo.classList.remove('blur');
    }
  }, 150);
}

function resetarJogo() {
  // parar o audio no resetJogo
  if (audioAtual) {
    audioAtual.pause();
    audioAtual.currentTime = 0;
  }
  audioAtual = null;
  senhaCorreta = gerarSenha();
  tentativa = "";
  tentativasRestantes = 5;
  tempoRestante = 120;
  posicoesFixas = [null, null, null, null];
  dicaposicaoUsada = false;
  dicaDigitoUsada = false;
  clearInterval(intervalo);
  document.getElementById('entrada').innerText = "";
  document.getElementById('mensagem').innerText = "";
  document.getElementById('timer').innerText = "02:00";
  document.getElementById('resetBtn').style.display = 'none';
  document.getElementById('historico').innerHTML = "";
  document.getElementById('dicaPosicao').disabled = false;
  document.getElementById('dicaDigito').disabled = false;
  criarBotoesNumericos();
  iniciarTimer();
  for (let i = 0; i <= 9; i++) {
    const btn = document.getElementById(`btn-${i}`);
    if (btn) {
      btn.style.backgroundColor = "";
      btn.disabled = false;
    }
  }
}

document.addEventListener("keydown", function(event) {
  if (event.key >= "0" && event.key <= "9") {
    adicionarNumero(event.key);
  } else if (event.key === "Enter") {
    tentarSenha();
  } else if (event.key === "Backspace") {
    tentativa = tentativa.slice(0, -1);
    atualizarEntrada();
  }
});

let dicaPosicaoUsada = false;
let dicaDigitoUsada = false;

function mostrarDicaPosicao() {
  if (dicaPosicaoUsada) return;
  for (let i = 0; i < senhaCorreta.length; i++) {
    if (posicoesFixas[i] === null) {
      posicoesFixas[i] = senhaCorreta[i];
      mostrarMensagem(`Dica: O dígito na posição ${i + 1} é ${senhaCorreta[i]}`, "lightblue");
      atualizarEntrada();
      dicaPosicaoUsada = true;
      document.getElementById('dicaPosicao').disabled = true;
      return;
    }
  }
  mostrarMensagem("Todas as posições já foram reveladas!", "orange");
}

function mostrarDicaDigito() {
  if (dicaDigitoUsada) return;
  const revelados = new Set(posicoesFixas.filter(p => p !== null));
  let naoRevelados = senhaCorreta.split('').filter(d => !revelados.has(d));
  if (naoRevelados.length > 0) {
    const indice = Math.floor(Math.random() * naoRevelados.length);
    const digito = naoRevelados[indice];
    mostrarMensagem(`Dica: O número ${digito} está na senha.`, "lightblue");
    dicaDigitoUsada = true;
    document.getElementById('dicaDigito').disabled = true;
  } else {
    mostrarMensagem("Todos os dígitos já foram revelados!", "orange");
  }
}