let sementes = [];
let limiteSementes = 9;
let tamanhoBase = 10;
let alturaBase = 3;
let corTronco;
let corFolhaInicial;
let corFolhaAdulta;
let taxaCrescimentoTronco = 1.5;
let taxaCrescimentoFolha = 1.2;
let estadoMaximo = 100;
let frasesConscientizacao = [
  "Plantar árvores é plantar o futuro.",
  "Cada árvore conta na luta contra as mudanças climáticas.",
  "Preserve as florestas, fontes de vida.",
  "Um ambiente saudável é um direito de todos.",
  "A natureza é nosso lar, cuide dela.",
  "Árvores purificam o ar que respiramos.",
  "A biodiversidade é essencial para o planeta.",
];
let ultimoEstadoFrase = 0;
let indiceFraseAtual = -1;
let estadoGeral = 0; // Novo estado geral para todas as árvores
let arbustosFundo = []; // Array para armazenar os arbustos do fundo
let alturaSolo = 50; // Altura da faixa de terra

let limiteAlturaArvoresY = 90; // A altura Y na tela onde as árvores devem parar de crescer (topo da nuvem mais baixa)

let gameState = "menu"; // Estado do jogo: 'menu', 'jogando', 'cidade', 'creditos'
let menuOptions = [
  { label: "Jogar", action: "jogar", x: 0, y: 0, w: 0, h: 0 },
  { label: "Créditos", action: "creditos", x: 0, y: 0, w: 0, h: 0 },
];
let creditsText = "Feito por João Roberto 1ºC";

let lixos = []; // Array para armazenar os lixos na fase da cidade
const NUM_LIXOS = 10; // Quantidade de lixos
let lixosColetados = 0; // Contador de lixos coletados

// Variáveis globais para os sons
let somColetaLixo;
let somBotao;

// Variáveis para as frases de lixo e temporização
let frasesLixo = [
  "Separe seu lixo, o planeta agradece!",
  "Reciclar é transformar o velho em novo.",
  "Compostar reduz o lixo orgânico em casa.",
  "O lixo no chão polui rios e oceanos.",
  "Cada resíduo tem seu lugar certo.",
  "Pense antes de descartar: reduza, reutilize, recicle.",
  "Pequenas atitudes geram grandes mudanças.",
  "Menos lixo, mais vida para todos.",
  "A natureza não produz lixo, nós sim.",
  "Um ambiente limpo começa com você.",
];
let frasesLixoExibidas = new Set(); // NOVO: Conjunto para armazenar frases de lixo já exibidas
let ultimaColetaTempo = 0; // Tempo em que o último lixo foi coletado
let tempoEntreColetas = 1300; // 1.3 segundos em milissegundos
let exibirFraseLixo = false; // Flag para controlar a exibição da frase
let fraseLixoAtual = ""; // A frase a ser exibida

function preload() {
  somColetaLixo = loadSound("collect-points-190037.mp3");
  somBotao = loadSound("game-start-317318.mp3");
}

function setup() {
  createCanvas(2000, 1000);
  corTronco = color(139, 69, 19); // Marrom
  corFolhaInicial = color(0, 150, 0); // Verde claro
  corFolhaAdulta = color(0, 100, 0); // Verde escuro

  let centerY = height / 2;
  let buttonHeight = 30;
  let buttonWidth = 150;
  let spacing = 10;

  menuOptions[0].x = width / 2 - buttonWidth / 2;
  menuOptions[0].y = centerY - buttonHeight / 2 - spacing - buttonHeight;
  menuOptions[0].w = buttonWidth;
  menuOptions[0].h = buttonHeight;

  menuOptions[1].x = width / 2 - buttonWidth / 2;
  menuOptions[1].y = centerY - buttonHeight / 2;
  menuOptions[1].w = buttonWidth;
  menuOptions[1].h = buttonHeight;
}

function draw() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "jogando") {
    drawGame();
  } else if (gameState === "creditos") {
    drawCredits();
  } else if (gameState === "cidade") {
    drawCidade();
  }
}

function drawMenu() {
  let corCeuInicial = color(135, 206, 235);
  let corCeuFinal = color(255, 255, 255);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(corCeuInicial, corCeuFinal, inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // --- Desenho da frase com borda e fundo ---
  let fraseTitulo = "Plantar para o Futuro";
  textSize(32);
  textAlign(CENTER, CENTER);
  textStyle(BOLD); // Deixa o texto em negrito

  // Calcula a largura e altura do texto para o fundo
  let textW = textWidth(fraseTitulo);
  let textH = textAscent() + textDescent();
  let padding = 15; // Espaçamento entre o texto e a borda/fundo

  // Fundo verde
  fill(0, 150, 0); // Verde escuro
  rect(width / 2 - textW / 2 - padding, height / 4 - textH / 2 - padding, textW + padding * 2, textH + padding * 2, 10); // Retângulo com bordas arredondadas

  // Borda branca
  stroke(255); // Cor branca para a borda
  strokeWeight(3); // Espessura da borda
  noFill(); // Não preenche o retângulo para que o fundo verde apareça
  rect(width / 2 - textW / 2 - padding, height / 4 - textH / 2 - padding, textW + padding * 2, textH + padding * 2, 10);

  // Texto (cor preta para contrastar com o verde)
  fill(0);
  noStroke(); // Garante que o texto não tenha borda
  text(fraseTitulo, width / 2, height / 4);
  textStyle(NORMAL); // Volta o estilo normal para outros textos
  // --- Fim do desenho da frase ---


  textSize(20);
  textAlign(CENTER, TOP);

  for (let i = 0; i < menuOptions.length; i++) {
    let option = menuOptions[i];
    fill(200);
    rect(option.x, option.y, option.w, option.h, 5);

    fill(0);
    text(option.label, option.x + option.w / 2, option.y + option.h / 3);
  }
}

function drawGame() {
  // Transição para a tela da cidade quando o crescimento for máximo
  if (estadoGeral >= estadoMaximo && gameState === "jogando") {
    gameState = "cidade";
    inicializarLixos(); // Prepara os lixos para a nova fase
    return; // Sai da função para não desenhar a tela de jogo por cima
  }

  let corCeuInicial = color(135, 206, 235);
  let corCeuFinal = color(255, 255, 255);
  for (let y = 0; y < height - alturaSolo; y++) {
    let inter = map(y, 0, height - alturaSolo, 0, 1);
    let c = lerpColor(corCeuInicial, corCeuFinal, inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // Sol
  fill(255, 255, 0); // Cor amarela para o sol
  ellipse(width - 50, 50, 50, 50); // Desenha um círculo para o sol

  // Nuvens
  fill(255, 255, 255, 200);
  ellipse(50, 50, 60, 40);
  ellipse(150, 80, 80, 50);
  ellipse(250, 60, 70, 45);
  ellipse(350, 90, 90, 55);

  for (let arbusto of arbustosFundo) {
    let tonalidadeVerde = floor(random(100, 180));
    let corArbusto = color(0, tonalidadeVerde, 0, 180);
    fill(corArbusto);
    noStroke();
    ellipse(
      arbusto.x,
      arbusto.y + arbusto.tamanho / 2,
      arbusto.tamanho,
      arbusto.tamanho / 2
    );
  }

  fill(101, 67, 33);
  rect(0, height - alturaSolo, width, alturaSolo);

  for (let i = 0; i < sementes.length; i++) {
    let semente = sementes[i];

    if (semente.estado === 0) {
      // Chamada para a nova função de desenhar semente realista
      desenharSementeRealista(semente.x, semente.y, tamanhoBase * 1.0);
    } else {
      let tamanhoAtual =
        tamanhoBase * pow(taxaCrescimentoFolha, semente.estado / 10);
      let alturaAtual =
        alturaBase * pow(taxaCrescimentoTronco, semente.estado / 8);

      let topoArvoreY = semente.y - alturaAtual * 2; // Calcula a posição Y do topo do tronco

      if (topoArvoreY < limiteAlturaArvoresY) {
        alturaAtual = (semente.y - limiteAlturaArvoresY) / 2;
      }
      alturaAtual = max(alturaAtual, 0); // Garante que a altura não seja negativa

      let corFolhaAtual = lerpColor(
        corFolhaInicial,
        corFolhaAdulta,
        semente.estado / 100
      );

      fill(corTronco);
      rect(semente.x - 2, semente.y - alturaAtual * 2, 4, alturaAtual * 2); // Desenha o tronco

      for (let j = 0; j < semente.estado / 5; j++) {
        push();
        translate(semente.x, semente.y - alturaAtual * 1.5); // Ajusta a posição Y para as folhas
        rotate(radians((j * 360) / (semente.estado / 5) + frameCount * 0.5));
        stroke(corTronco);
        line(0, 0, alturaAtual * 0.5, 0);
        noStroke();
        fill(corFolhaAtual);
        ellipse(alturaAtual * 0.5, 0, tamanhoAtual * 0.3, tamanhoAtual * 0.3);
        pop();

        if (j % 2 === 0 && semente.estado > 10) {
          push();
          translate(semente.x, semente.y - alturaAtual * 1.2); // Ajusta a posição Y para as folhas secundárias
          rotate(
            radians((j * 360) / (semente.estado / 5) + 30 + frameCount * 0.3)
          );
          stroke(corTronco);
          line(0, 0, alturaAtual * 0.3, 0);
          noStroke();
          fill(corFolhaAtual);
          ellipse(alturaAtual * 0.3, 0, tamanhoAtual * 0.2, tamanhoAtual * 0.2);
          pop();
        }
      }
    }
  }

  fill(0);
  textSize(12);
  textAlign(LEFT, TOP);
  text("Crescimento: " + estadoGeral + "/" + estadoMaximo, 10, 10);

  fill(0);
  textSize(12);
  textAlign(CENTER, TOP);
  if (sementes.length < limiteSementes) {
    text(
      "Clique no solo para plantar uma semente (" +
        sementes.length +
        "/" +
        limiteSementes +
        ")",
      width / 2,
      30
    );
  } else {
    text(
      "Limite de " +
        limiteSementes +
        " sementes atingido. Pressione ESPAÇO para crescer.",
      width / 2,
      30
    );
  }

  if (estadoGeral > 0 && estadoGeral % 15 === 0) {
    let indice = floor(estadoGeral / 15) - 1;
    if (indice < frasesConscientizacao.length && indice !== indiceFraseAtual) {
      indiceFraseAtual = indice;
    }
  }

  if (
    indiceFraseAtual !== -1 &&
    indiceFraseAtual < frasesConscientizacao.length
  ) {
    let fraseAtual = frasesConscientizacao[indiceFraseAtual];

    // Define o tamanho do texto ANTES de calcular a largura
    textSize(14);
    textStyle(BOLD); // O estilo também afeta a largura

    let textW = textWidth(fraseAtual);
    let textH = textAscent() + textDescent(); // Calcula a altura real do texto
    let padding = 10;

    fill(255);
    noStroke();
    // Ajusta a posição Y para centralizar melhor a frase no fundo
    rect(
      width / 2 - textW / 2 - padding,
      height - alturaSolo - 50 - textH / 2 - padding,
      textW + padding * 2,
      textH + padding * 2,
      5
    );

    stroke(255);
    strokeWeight(1);
    fill(0);
    // As propriedades de texto já foram definidas acima
    textAlign(CENTER, CENTER);
    text(
      frasesConscientizacao[indiceFraseAtual],
      width / 2,
      height - alturaSolo - 50
    );
    textStyle(NORMAL);
    noStroke();
  }
}

function drawCidade() {
  // Céu azul escuro para a noite
  background(20, 30, 80);

  // Lua
  fill(240, 240, 240); // Cor da lua
  ellipse(width - 70, 70, 60, 60); // Desenha a lua

  // Algumas "crateras" na lua para realismo
  fill(180, 180, 180);
  ellipse(width - 80, 65, 10, 10);
  ellipse(width - 60, 80, 15, 15);
  ellipse(width - 75, 90, 8, 8);


  // Chão da cidade (asfalto/calçada)
  fill(80); // Cor cinza escuro
  rect(0, height - alturaSolo, width, alturaSolo);

  // Edifícios (exemplos simples)
  fill(150); // Cor cinza médio
  rect(50, height - alturaSolo - 100, 60, 100);
  fill(170);
  rect(120, height - alturaSolo - 150, 70, 150);
  fill(160);
  rect(200, height - alturaSolo - 80, 50, 80);
  fill(180);
  rect(270, height - alturaSolo - 120, 80, 120);

  // Janelas (algumas acesas para simular vida noturna)
  fill(255, 255, 0, 200); // Amarelo para simular luz
  rect(55, height - alturaSolo - 90, 10, 15);
  rect(70, height - alturaSolo - 90, 10, 15);
  // rect(85, height - alturaSolo - 90, 10, 15); // Essa janela apagada

  rect(125, height - alturaSolo - 140, 12, 18);
  // rect(140, height - alturaSolo - 140, 12, 18); // Essa janela apagada
  rect(155, height - alturaSolo - 140, 12, 18);

  rect(205, height - alturaSolo - 70, 8, 12);
  rect(220, height - alturaSolo - 70, 8, 12);

  // rect(235, height - alturaSolo - 70, 8, 12); // Mais uma janela para o prédio 3, apagada

  rect(275, height - alturaSolo - 110, 15, 20);
  rect(295, height - alturaSolo - 110, 15, 20);
  rect(315, height - alturaSolo - 110, 15, 20);

  // Desenha os lixos
  for (let i = 0; i < lixos.length; i++) {
    let lixo = lixos[i];
    push(); // Salva o estado atual do P5.js
    translate(lixo.x, lixo.y);
    rotate(lixo.rotacao); // Aplica a rotação

    noStroke();
    // Cores ajustadas para melhor visibilidade
    if (lixo.tipo === "papel") {
      fill(220, 200, 180); // Papel amassado, mais claro e amarelado
      ellipse(0, 0, lixo.tamanho * 0.8, lixo.tamanho * 0.6);
      rect(
        -lixo.tamanho * 0.3,
        lixo.tamanho * 0.2,
        lixo.tamanho * 0.4,
        lixo.tamanho * 0.2,
        2
      ); // Aba
    } else if (lixo.tipo === "plastico") {
      fill(100, 100, 220, 200); // Azul plástico mais vibrante
      rect(
        -lixo.tamanho * 0.4,
        -lixo.tamanho * 0.3,
        lixo.tamanho * 0.8,
        lixo.tamanho * 0.6,
        5
      ); // Garrafa retangular
    } else if (lixo.tipo === "vidro") {
      fill(150, 200, 150, 180); // Vidro esverdeado mais claro e com mais transparência
      ellipse(0, 0, lixo.tamanho * 0.7, lixo.tamanho * 0.9); // Garrafa
      rect(
        -lixo.tamanho * 0.1,
        -lixo.tamanho * 0.4,
        lixo.tamanho * 0.2,
        lixo.tamanho * 0.1
      ); // Tampa
    } else if (lixo.tipo === "metal") {
      fill(140, 140, 140); // Metal acinzentado mais claro
      rect(
        -lixo.tamanho * 0.3,
        -lixo.tamanho * 0.4,
        lixo.tamanho * 0.6,
        lixo.tamanho * 0.7,
        3
      ); // Lata
    } else if (lixo.tipo === "organico") {
      fill(100, 60, 30); // Orgânico marrom mais claro e com mais contraste
      ellipse(0, 0, lixo.tamanho, lixo.tamanho * 0.7); // Forma orgânica irregular
    }
    pop(); // Restaura o estado anterior do P5.js
  }

  // Texto de lixos coletados
  fill(255); // Texto branco para contrastar com o céu escuro
  textSize(16);
  textAlign(LEFT, TOP);
  text("Lixos coletados: " + lixosColetados + "/" + NUM_LIXOS, 10, 10);

  // Nova frase de instrução
  text("Clique nos Lixos para limpar a cidade!", 10, 30);

  // Lógica para exibir a frase de ecologia do lixo
  if (exibirFraseLixo) {
    fill(255); // Fundo branco para a frase
    noStroke();
    let textW = textWidth(fraseLixoAtual);
    let textH = textSize();
    let padding = 10;
    rect(
      width / 2 - textW / 2 - padding,
      height / 2 - textH / 2 - padding - 50, // Posiciona um pouco acima do centro
      textW + padding * 2,
      textH + padding * 2,
      5
    );

    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(fraseLixoAtual, width / 2, height / 2 - 50);

    // Verifica se o tempo da frase já passou
    if (millis() - ultimaColetaTempo > tempoEntreColetas) {
      exibirFraseLixo = false; // Desativa a exibição da frase
    }
  }

  if (lixosColetados >= NUM_LIXOS) {
    fill(0, 200, 0); // Verde para mensagem de sucesso (mais vibrante no escuro)
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Cidade Limpa!", width / 2, height / 2 - 30); // Desloquei para cima para a frase de menu
    textSize(18);
    text("Parabéns!", width / 2, height / 2);

    // Fundo branco para a frase de voltar ao menu
    let phrase = "Clique para voltar ao Menu";
    let textW = textWidth(phrase);
    let textH = textSize();
    let padding = 10;
    fill(255); // Cor branca para o fundo
    noStroke();
    rect(
      width / 2 - textW / 2 - padding,
      height / 2 + 50 - textH / 2 - padding,
      textW + padding * 2,
      textH + padding * 2,
      5
    );

    fill(0); // Cor preta para o texto
    text(phrase, width / 2, height / 2 + 50);
  }
}

function drawCredits() {
  background(135, 206, 235);
  fill(101, 67, 33);
  rect(0, height - alturaSolo, width, alturaSolo);

  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(creditsText, width / 2, height / 2 - 30);

  // Fundo branco para a frase de voltar ao menu
  let phrase = "Clique para voltar ao Menu";
  let textW = textWidth(phrase);
  let textH = textSize();
    let padding = 10;
  fill(255); // Cor branca para o fundo
  noStroke();
  rect(
    width / 2 - textW / 2 - padding,
    height / 2 + 30 - textH / 2 - padding,
    textW + padding * 2,
    textH + padding * 2,
    5
  );

  fill(0); // Cor preta para o texto
  text(phrase, width / 2, height / 2 + 30);
}

// NOVA FUNÇÃO: Desenha uma semente mais realista
function desenharSementeRealista(x, y, tamanho) {
  push(); // Salva as configurações atuais de desenho
  translate(x, y); // Move a origem para a posição da semente

  // Sombra suave para dar profundidade
  fill(0, 0, 0, 30); // Cor preta com transparência
  ellipse(tamanho * 0.05, tamanho * 0.1, tamanho * 0.8, tamanho * 0.4); // Sombra oval ligeiramente deslocada

  // Base da semente (marrom escuro com leve variação)
  let corBaseSemente = color(120, 80, 40);
  fill(corBaseSemente);
  // Desenha uma forma oval mais natural
  ellipse(0, 0, tamanho * 0.7, tamanho * 1.1);

  // Detalhes de textura com cores ligeiramente mais claras/escuras
  noStroke();
  fill(150, 100, 60, 200); // Tom mais claro
  ellipse(tamanho * -0.15, tamanho * -0.2, tamanho * 0.3, tamanho * 0.5);
  fill(90, 60, 30, 150); // Tom mais escuro
  ellipse(tamanho * 0.1, tamanho * 0.2, tamanho * 0.4, tamanho * 0.3);

  // Pequena folha brotando
  fill(0, 180, 0); // Verde vibrante
  triangle(
    -tamanho * 0.3,
    tamanho * 0.3,
    tamanho * 0.3,
    tamanho * 0.3,
    0,
    tamanho * 0.7
  );

  pop(); // Restaura as configurações de desenho
}


function mousePressed() {
  if (gameState === "menu") {
    for (let i = 0; i < menuOptions.length; i++) {
      let option = menuOptions[i];
      if (
        mouseX > option.x &&
        mouseX < option.x + option.w &&
        mouseY > option.y &&
        mouseY < option.y + option.h
      ) {
        if (somBotao.isLoaded()) {
          somBotao.play();
        }
        if (option.action === "jogar") {
          gameState = "jogando";
          sementes = [];
          estadoGeral = 0;
          ultimoEstadoFrase = 0;
          indiceFraseAtual = -1;
          lixos = [];
          lixosColetados = 0;
          exibirFraseLixo = false;
          frasesLixoExibidas.clear(); // NOVO: Limpa as frases de lixo exibidas ao iniciar o jogo

          if (arbustosFundo.length === 0) {
            for (let i = 0; i < 10; i++) {
              arbustosFundo.push({
                x: random(width),
                y: random(height - alturaSolo, height - alturaSolo / 2),
                tamanho: random(30, 60),
              });
            }
          }
        } else if (option.action === "creditos") {
          gameState = "creditos";
        }
        break;
      }
    }
  } else if (gameState === "jogando") {
    if (mouseY > height - alturaSolo && sementes.length < limiteSementes) {
      let podePlantar = true;
      let distanciaMinima = 20;

      for (let sementeExistente of sementes) {
        let d = dist(mouseX, mouseY, sementeExistente.x, sementeExistente.y);
        if (d < distanciaMinima) {
          podePlantar = false;
          break;
        }
      }

      if (podePlantar) {
        sementes.push({ x: mouseX, y: mouseY, estado: 0 });
      }
    }
  } else if (gameState === "creditos") {
    if (somBotao.isLoaded()) {
      somBotao.play();
    }
    gameState = "menu";
  } else if (gameState === "cidade") {
    // Se todos os lixos foram coletados, verifica o clique no botão de voltar ao menu
    if (lixosColetados >= NUM_LIXOS) {
      // Definir as propriedades do botão "Voltar ao Menu" para poder verificar o clique
      let phrase = "Clique para voltar ao Menu";
      textSize(18); // Use o mesmo textSize do drawCidade() para cálculos precisos
      let textW = textWidth(phrase);
      let textH = textAscent() + textDescent(); // Altura real do texto
      let padding = 10;

      let buttonX = width / 2 - textW / 2 - padding;
      let buttonY = height / 2 + 50 - textH / 2 - padding; // Posição Y do topo do botão
      let buttonW = textW + padding * 2;
      let buttonH = textH + padding * 2;

      // Verifica se o clique está dentro da área do botão
      if (
        mouseX > buttonX &&
        mouseX < buttonX + buttonW &&
        mouseY > buttonY &&
        mouseY < buttonY + buttonH
      ) {
        if (somBotao.isLoaded()) {
          somBotao.play();
        }
        gameState = "menu";
        exibirFraseLixo = false; // Garante que a frase de lixo não apareça no menu
      }
    } else {
      // Lógica existente para coletar lixos se ainda houver
      if (
        millis() - ultimaColetaTempo > tempoEntreColetas ||
        !exibirFraseLixo
      ) {
        for (let i = lixos.length - 1; i >= 0; i--) {
          let lixo = lixos[i];
          let d = dist(mouseX, mouseY, lixo.x, lixo.y);
          if (d < lixo.tamanho / 1.5) {
            if (somColetaLixo.isLoaded()) {
              somColetaLixo.play();
            }
            lixos.splice(i, 1);
            lixosColetados++;

            ultimaColetaTempo = millis();
            // NOVO: Seleciona uma frase de lixo não repetida
            if (frasesLixoExibidas.size < frasesLixo.length) {
              let novaFrase = random(frasesLixo);
              while (frasesLixoExibidas.has(novaFrase)) {
                novaFrase = random(frasesLixo);
              }
              fraseLixoAtual = novaFrase;
              frasesLixoExibidas.add(novaFrase);
            } else {
              // Se todas as frases foram exibidas, opcionalmente pode reiniciar ou exibir uma padrão
              frasesLixoExibidas.clear(); // Reinicia o conjunto se todas foram exibidas
              fraseLixoAtual = random(frasesLixo); // Seleciona uma frase aleatória
              frasesLixoExibidas.add(fraseLixoAtual);
            }

            exibirFraseLixo = true;

            break;
          }
        }
      }
    }
  }
}

function keyPressed() {
  if (gameState === "jogando") {
    if (key === " " || keyCode === 32) {
      if (sementes.length > 0) {
        let algumaSementeCresceu = false;
        for (let semente of sementes) {
          let proximaAlturaPotencial =
            alturaBase * pow(taxaCrescimentoTronco, (semente.estado + 1) / 8);
          let proximoTopoArvoreY = semente.y - proximaAlturaPotencial * 2;

          if (
            semente.estado < estadoMaximo &&
            proximoTopoArvoreY >= limiteAlturaArvoresY
          ) {
            semente.estado += 1;
            semente.estado = min(semente.estado, estadoMaximo);
            algumaSementeCresceu = true;
          } else if (
            semente.estado < estadoMaximo &&
            proximoTopoArvoreY < limiteAlturaArvoresY
          ) {
            semente.estado += 1;
            semente.estado = min(semente.estado, estadoMaximo);
            algumaSementeCresceu = true;
          }
        }
        if (algumaSementeCresceu) {
          estadoGeral = min(estadoGeral + 1, estadoMaximo);
        }
      }
    }
  }
}

function inicializarLixos() {
  lixos = [];
  lixosColetados = 0;
  exibirFraseLixo = false;
  ultimaColetaTempo = 0;
  frasesLixoExibidas.clear(); // NOVO: Garante que o conjunto de frases exibidas é limpo ao iniciar a fase da cidade

  let tiposLixo = ["papel", "plastico", "vidro", "metal", "organico"];
  for (let i = 0; i < NUM_LIXOS; i++) {
    lixos.push({
      x: random(50, width - 50),
      y: random(height - alturaSolo + 10, height - 10),
      tamanho: random(20, 35),
      tipo: random(tiposLixo),
      rotacao: random(-PI / 8, PI / 8),
    });
  }
}