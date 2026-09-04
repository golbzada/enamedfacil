import fs from "node:fs";

/* ===========================================================================
   Gera index-b.html a partir de index.html.
   Fase 1: fatia o documento em blocos <section>
   Fase 2: reordena as seções
   Fase 3: aplica as mudanças da variante B
   =========================================================================== */

const bruto = fs.readFileSync("index.html", "utf8");
const usaCRLF = bruto.includes("\r\n");
const linhas = bruto.replace(/\r\n/g, "\n").split("\n");

/* --- Fase 1: fatiar -------------------------------------------------------- */

const aberturas = [];
const fechamentos = [];
linhas.forEach((linha, idx) => {
  if (linha === "      <section" || linha.startsWith("      <section "))
    aberturas.push(idx);
  if (linha === "      </section>") fechamentos.push(idx);
});

if (aberturas.length !== fechamentos.length) {
  throw new Error("Seções desbalanceadas no index.html");
}

const cabecalho = linhas.slice(0, aberturas[0]).join("\n");
const rodape = linhas.slice(fechamentos[fechamentos.length - 1] + 1).join("\n");

// Texto entre uma seção e a próxima (comentários soltos), preservado
const secoes = aberturas.map((ini, n) => ({
  html: linhas.slice(ini, fechamentos[n] + 1).join("\n"),
  cola: linhas.slice(fechamentos[n] + 1, aberturas[n + 1] ?? fechamentos[n] + 1).join("\n"),
}));

const acha = (trecho) => {
  const n = secoes.findIndex((s) => s.html.includes(trecho));
  if (n < 0) throw new Error("Seção não encontrada: " + trecho);
  return n;
};

const HERO = acha("hero-mapas-abertos.png");
const AMOSTRAS = acha('id="amostras"');
const OQUE_CAI = acha("O que mais cai na prova");
const DEPOIMENTOS = acha("chega diferente na prova");
const RETA_FINAL = acha("A prova do ENAMED está chegando");
const PARA_QUEM = acha("Para quem é o material");
const CALENDARIO = acha("não cabe mais no calendário");
const MODULOS = acha('id="modulos"');
const BONUS = acha("E você ainda recebe 5 bônus");
const PASSO = acha("Passo a passo do acesso");
const PLANOS = acha('id="planos"');
const GARANTIA = acha("Garantia incondicional");
const FAQ = acha("Perguntas frequentes");

/* --- Fase 2: reordenar ----------------------------------------------------- */

// Pedido: "passo a passo" desce para depois dos planos,
// e "reta final" desce para depois do passo a passo.
const novaOrdem = [
  HERO,
  AMOSTRAS,
  OQUE_CAI,
  DEPOIMENTOS,
  PARA_QUEM,
  CALENDARIO,
  MODULOS,
  BONUS,
  PLANOS,
  PASSO, // <- desceu: imediatamente abaixo dos planos
  GARANTIA,
  FAQ,
];

// Seções do index.html que ficam de fora da variante B
const removidas = [
  RETA_FINAL, // caixa escura "Faltam N dias para a prova"
];

if (novaOrdem.length + removidas.length !== secoes.length) {
  throw new Error(
    "A nova ordem tem " +
      novaOrdem.length +
      " seções + " +
      removidas.length +
      " removidas, mas o arquivo tem " +
      secoes.length,
  );
}

for (const n of novaOrdem) {
  if (removidas.includes(n)) {
    throw new Error("Seção está na ordem e na lista de removidas ao mesmo tempo");
  }
}

/* --- Fase 3: peças da variante B ------------------------------------------- */

const ctaBloco = (titulo, sub, rotulo) => `
      <!-- [B] CTA plantado em vão sem saída -->
      <section style="padding: clamp(40px, 5vw, 64px) 0; background: #f5f5f4">
        <div
          style="
            max-width: 700px;
            margin: 0 auto;
            padding: 0 clamp(20px, 4vw, 32px);
            text-align: center;
          "
        >
          <h3
            style="
              font-size: clamp(21px, 2.8vw, 28px);
              line-height: 1.2;
              font-weight: 600;
              color: #093235;
            "
          >
            ${titulo}
          </h3>
          <p style="margin-top: 12px; font-size: 15.5px; color: #4e5e5f">
            ${sub}
          </p>
          <a
            href="#planos"
            class="btn-primary"
            style="margin-top: 24px; display: inline-flex"
          >
            ${rotulo}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 17px; height: 17px"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <p style="margin-top: 14px; font-size: 13px; color: #5e6e6a">
            Acesso vitalício &middot; Download imediato &middot; Garantia de 7
            dias
          </p>
        </div>
      </section>
`;

// Cronômetro da barra de topo. O script original da página já escreve
// "faltam N dias" na carga — isso aqui assume a partir dali e passa a
// atualizar de segundo em segundo.
const cronometro = `
    <!-- [B] Contagem regressiva viva na barra de topo -->
    <style>
      [data-countdown="curto"] {
        /* sem isso a largura dança a cada segundo, porque os dígitos têm
           larguras diferentes e a barra inteira treme */
        font-variant-numeric: tabular-nums;
      }
    </style>
    <script>
      (function () {
        var alvo = document.querySelector('[data-countdown="curto"]');
        if (!alvo) return;

        // Meia-noite do dia da prova, mesmo alvo do script original
        var prova = new Date(2026, 8, 13, 0, 0, 0, 0);
        var doisDigitos = function (n) {
          return n < 10 ? "0" + n : "" + n;
        };

        var timer = null;

        function tick() {
          var resta = prova - new Date();

          if (resta <= 0) {
            // No dia da prova e depois, quem manda é o texto do script original
            parar();
            return;
          }

          var s = Math.floor(resta / 1000);
          var d = Math.floor(s / 86400);
          var h = Math.floor((s % 86400) / 3600);
          var m = Math.floor((s % 3600) / 60);

          alvo.textContent =
            "faltam " +
            d +
            "d " +
            doisDigitos(h) +
            "h " +
            doisDigitos(m) +
            "m " +
            doisDigitos(s % 60) +
            "s";

          // Alinha no próximo segundo cheio em vez de somar 1000 e acumular atraso
          timer = setTimeout(tick, 1000 - (Date.now() % 1000));
        }

        function parar() {
          if (timer) clearTimeout(timer);
          timer = null;
        }

        // Aba escondida não precisa contar: economiza bateria no celular
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            parar();
          } else if (!timer) {
            tick();
          }
        });

        tick();
      })();
    </script>
`;

const barraFixa = `
    <!-- [B] Barra fixa mobile: o preço nunca some da tela -->
    <style>
      .barra-fixa {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 90;
        display: none;
        align-items: center;
        gap: 12px;
        padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
        background: rgba(6, 33, 35, 0.97);
        border-top: 1px solid rgba(218, 241, 222, 0.14);
        transform: translateY(115%);
        transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .barra-fixa.visivel {
        transform: translateY(0);
      }
      .barra-fixa-info {
        flex: 1 1 auto;
        min-width: 0;
        text-align: left;
      }
      .barra-fixa-preco {
        font-size: 15px;
        font-weight: 700;
        color: #fff;
        line-height: 1.25;
      }
      .barra-fixa-sub {
        font-size: 11.5px;
        color: rgba(218, 241, 222, 0.66);
        line-height: 1.3;
        margin-top: 1px;
      }
      .barra-fixa-btn {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 12px 18px;
        border-radius: 999px;
        background: #d4eced;
        color: #093235;
        font-size: 14.5px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
      }
      @media (max-width: 900px) {
        .barra-fixa {
          display: flex;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .barra-fixa {
          transition: none;
        }
      }
    </style>
    <div class="barra-fixa" id="barraFixa" aria-hidden="true">
      <div class="barra-fixa-info">
        <div class="barra-fixa-preco">A partir de R$ 19,90</div>
        <div class="barra-fixa-sub">
          Acesso vitalício &middot; garantia de 7 dias
        </div>
      </div>
      <a href="#planos" class="barra-fixa-btn">Ver planos</a>
    </div>
    <script>
      (function () {
        var barra = document.getElementById("barraFixa");
        var planos = document.getElementById("planos");
        if (!barra) return;

        var ultimo = null;

        function atualizar() {
          var passouHero = window.scrollY > 700;
          var emPlanos = false;
          if (planos) {
            var r = planos.getBoundingClientRect();
            emPlanos = r.top < window.innerHeight * 0.9 && r.bottom > 0;
          }
          var mostrar = passouHero && !emPlanos;
          if (mostrar === ultimo) return;
          ultimo = mostrar;
          barra.classList.toggle("visivel", mostrar);
          barra.setAttribute("aria-hidden", String(!mostrar));
        }

        window.addEventListener("scroll", atualizar, { passive: true });
        window.addEventListener("resize", atualizar, { passive: true });
        atualizar();
      })();
    </script>
`;

/* --- Fase 3a: editar blocos individuais ------------------------------------ */

const trocaUnica = (texto, de, para, rotulo) => {
  const partes = texto.split(de);
  if (partes.length !== 2) {
    throw new Error(
      "Esperava 1 ocorrência de " + rotulo + ", achei " + (partes.length - 1),
    );
  }
  return partes.join(para);
};

// Hero: pinta na hora (sem fade) e botões trocam de papel
secoes[HERO].html = secoes[HERO].html
  .replace(/\n\s*data-reveal(?=\s|>|$)/g, "")
  .replace(/\n\s*data-d="\d+"(?=\s|>|$)/g, "")
  .replace(/ data-reveal(?=\s|>)/g, "")
  .replace(/ data-d="\d+"(?=\s|>)/g, "");

secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  '<a href="#planos" class="btn-primary pulse-cta">\n              Quero revisar com os mapas',
  // #amostras, não #modulos: "por dentro" é a faixa que mostra o miolo do
  // mapa. #modulos lista os temas por área, que é outra promessa.
  '<a href="#amostras" class="btn-primary pulse-cta">\n              Ver os 120 mapas por dentro',
  "botão primário do hero",
);

secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  '<a href="#amostras" class="btn-secondary">\n              Ver o que vem no material',
  '<a href="#planos" class="btn-secondary">\n              Quero garantir meu acesso',
  "botão secundário do hero",
);

// Hero: título e subtítulo enxutos.
// Original (pra voltar atrás, é só reverter estas duas trocas):
//   h1: "Revise os principais temas do ENAMED 2026 na reta final
//        de forma rápida, organizada e visual."   (93 caracteres)
//   p : "120 mapas clínicos visuais de revisão para o ENAMED, organizados
//        por grandes áreas, feitos para revisar rapidamente os pontos
//        essenciais e chegar na prova com o conteúdo fresco."  (177 caracteres)
secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  `            Revise os principais temas do ENAMED 2026
            <em`,
  `            Revise o que mais cai no ENAMED 2026
            <em`,
  "primeira metade do h1",
);

secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  `              >na reta final</em
            >
            de forma rápida, organizada e visual.`,
  `              >batendo o olho</em
            >.`,
  "segunda metade do h1",
);

secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  `            120 mapas clínicos visuais de revisão para o ENAMED, organizados por
            grandes áreas, feitos para revisar rapidamente os pontos essenciais e
            chegar na prova com o conteúdo fresco.`,
  `            120 mapas visuais das 6 grandes áreas, pra reta final.`,
  "subtítulo do hero",
);

/* --- Amostras: duas faixas empilhadas viram uma faixa só ------------------- */

// Eram duas sanfonas, uma em cima da outra, indo em sentidos opostos. Fica
// confuso: o olho não sabe qual seguir e nenhuma das duas dá pra ler.
// Uma linha só, com card bem maior, deixa o mapa realmente visível.
// Ordem alternando aparelho pra não emendar três corações seguidos.
const amostras = [
  { img: "insuficiencia-cardiaca.jpeg", nome: "Insuficiência Cardíaca" },
  { img: "derrame-pleural.jpeg", nome: "Derrame Pleural" },
  { img: "crise-convulsiva.jpeg", nome: "Crise Convulsiva" },
  { img: "bradicardias.jpeg", nome: "Bradicardias" },
  { img: "infeccao-trato-urinario.jpeg", nome: "Infecção do Trato Urinário" },
  { img: "ecg.jpeg", nome: "ECG" },
  { img: "hipoglicemia.jpeg", nome: "Hipoglicemia" },
  { img: "taquicardias.jpeg", nome: "Taquicardias" },
  { img: "acidose-e-alcalose.jpeg", nome: "Acidose e Alcalose" },
  { img: "bloqueios-av.jpeg", nome: "Bloqueios AV" },
];

const cardAmostra = (a, clone) => `
            <div class="amostra-card"${clone ? ' aria-hidden="true"' : ""}>
              <img
                src="assets/img/amostras/${a.img}"
                alt="${clone ? "" : "Prévia do mapa clínico — " + a.nome}"
                width="900"
                height="672"
                loading="lazy"
                decoding="async"
              />
            </div>`;

const faixaAmostras = `        <!-- [B] Faixa única de amostras -->
        <style>
          .amostra-card {
            /* 86vw deixa a próxima espiando no canto e o mapa quase inteiro
               na tela do celular; no desktop trava em 520px */
            width: min(86vw, 520px);
            flex: 0 0 auto;
            padding: 10px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow:
              0 1px 2px rgba(0, 0, 0, 0.2),
              0 20px 40px -20px rgba(0, 0, 0, 0.4);
          }
          .amostra-card img {
            display: block;
            width: 100%;
            height: auto;
            /* proporção real do arquivo (900x672): não corta nada */
            aspect-ratio: 900 / 672;
            object-fit: cover;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.04);
          }
        </style>
        <div
          style="margin-top: clamp(32px, 4vw, 48px)"
          class="marquee-container"
          data-speed="0.7"
          data-direction="1"
        >
          <div class="marquee-track">${amostras.map((a) => cardAmostra(a, false)).join("")}
            <!-- Clones -->${amostras.map((a) => cardAmostra(a, true)).join("")}
          </div>
        </div>

        <!-- [B] Mesmo pré-carregamento dos depoimentos: sem isso o card entra
             na sanfona em branco e a imagem aparece do nada. -->
        <script>
          (function () {
            var secao = document.currentScript.parentNode;
            var fotos = secao.querySelectorAll(".amostra-card img");
            if (!fotos.length) return;
            var feito = false;

            function carregarTodas() {
              if (feito) return;
              feito = true;
              for (var i = 0; i < fotos.length; i++) fotos[i].loading = "eager";
              window.removeEventListener("scroll", verificar);
              window.removeEventListener("resize", verificar);
            }

            function verificar() {
              if (secao.getBoundingClientRect().top < window.innerHeight + 800) {
                carregarTodas();
              }
            }

            window.addEventListener("scroll", verificar, { passive: true });
            window.addEventListener("resize", verificar, { passive: true });
            verificar();
          })();
        </script>
`;

secoes[AMOSTRAS].html =
  secoes[AMOSTRAS].html.slice(
    0,
    secoes[AMOSTRAS].html.indexOf("        <!-- Track A: Normal Direction -->"),
  ) +
  faixaAmostras +
  "      </section>";

if (secoes[AMOSTRAS].html.includes("Track B")) {
  throw new Error("As faixas antigas de amostras não foram substituídas");
}

/* --- Selo acima da headline ------------------------------------------------ */

// "ENAMED 2026" repetia o que a barra de cima e o próprio H1 já dizem.
// "Material auxiliar de revisão" diz o que a página é, e de quebra deixa
// claro que não é curso — que é a objeção da seção do calendário.
secoes[HERO].html = trocaUnica(
  secoes[HERO].html,
  '<span class="badge-dot"></span>ENAMED 2026',
  '<span class="badge-dot"></span>Material auxiliar de revisão',
  "selo acima do H1",
);

/* --- Prova social: sai do hero, vai pros depoimentos ----------------------- */

// No hero ela ficava logo abaixo dos 4 benefícios, com as estrelas soltas na
// esquerda e o texto quebrando em duas linhas. Some daqui e reaparece
// centralizada sob o título dos depoimentos, que é onde ela tem contexto.
{
  const html = secoes[HERO].html;
  const ini = html.indexOf("          <!-- Social Proof Badge -->");
  const marcaFim = html.indexOf("revisam com os mapas</span", ini);
  if (ini < 0 || marcaFim < 0) {
    throw new Error("Selo de prova social não encontrado no hero");
  }
  const fim = html.indexOf("</div>", marcaFim) + "</div>".length;
  secoes[HERO].html = html.slice(0, ini).replace(/\n+$/, "\n") + html.slice(fim).replace(/^\n+/, "\n");
}

// "de medicina" saiu: quem está lendo a página já é estudante de medicina.
// Sem ele o selo cabe numa linha só, que é o que desentorta as estrelas.
const seloProvaSocial = `
          <div class="prova-social">
            <span class="prova-estrelas" aria-label="5 de 5 estrelas"
              >★★★★★</span
            >
            <span class="prova-texto"
              ><b>+5.000 estudantes</b> já revisam com os mapas</span
            >
          </div>`;

/* --- Decisão clínica: imagem no topo de cada card -------------------------- */

// Ilustrações 16:9 geradas na paleta da página, recortadas e comprimidas
// por comprime-cards-clinicos.ps1.
const cardsClinicos = [
  {
    img: "card-1-diagnostico.jpg",
    alt: "Estetoscópio e lupa sobre fundo claro, com a silhueta de um coração ao fundo",
  },
  {
    img: "card-2-conduta.jpg",
    alt: "Frasco de medicação, seringa e cartela de comprimidos, com bolsa de soro ao fundo",
  },
  {
    img: "card-3-exames.jpg",
    alt: "Tubos de ensaio em suporte e microscópio, com um painel de raio-X iluminado ao fundo",
  },
];

/**
 * Põe uma ilustração sangrada no topo de cada card de uma seção.
 *
 * Tira o padding do card e joga o conteúdo num wrapper interno; com
 * overflow:hidden, o border-radius que o card já tinha recorta o topo da
 * imagem sozinho — nenhum raio duplicado, nada pra manter em sincronia.
 *
 * Estoura se o número de cards não bater, pra nunca escrever no lugar errado.
 */
const poeImagemNosCards = ({ secao, nome, estiloAntigo, estiloNovo, pasta, imagens, padding }) => {
  const pedacos = secoes[secao].html.split(estiloAntigo);
  if (pedacos.length !== imagens.length + 1) {
    throw new Error(
      `Esperava ${imagens.length} cards em "${nome}", achei ${pedacos.length - 1}`,
    );
  }

  const fecha = "              </ul>\n            </div>";
  const fechaNovo = "              </ul>\n              </div>\n            </div>";

  secoes[secao].html = pedacos
    .map((pedaco, n) => {
      if (n === 0) return pedaco;
      const c = imagens[n - 1];
      if (!pedaco.includes(fecha)) {
        throw new Error(`Card sem fechamento reconhecível em "${nome}"`);
      }
      return (
        estiloNovo +
        `              <img
                class="card-img"
                src="assets/img/${pasta}/${c.img}"
                alt="${c.alt}"
                width="800"
                height="450"
                loading="lazy"
                decoding="async"
              />
              <div class="card-img-corpo" style="padding: ${padding}">
` +
        // replace com string troca só a PRIMEIRA ocorrência: fecha o wrapper
        // deste card sem encostar no próximo, que pode ainda não ter um.
        pedaco.replace(fecha, fechaNovo)
      );
    })
    .join("");
};

poeImagemNosCards({
  secao: OQUE_CAI,
  nome: "O que mais cai na prova",
  pasta: "decisao-clinica",
  imagens: cardsClinicos,
  padding: "22px 24px 24px",
  estiloAntigo: `              style="
                padding: 24px;
                border-radius: 18px;
                background: #fbfbfa;
                border: 1px solid rgba(11, 43, 38, 0.1);
                box-shadow: 0 1px 2px rgba(11, 43, 38, 0.04);
              "
            >
`,
  estiloNovo: `              style="
                border-radius: 18px;
                overflow: hidden;
                background: #fbfbfa;
                border: 1px solid rgba(11, 43, 38, 0.1);
                box-shadow: 0 1px 2px rgba(11, 43, 38, 0.04);
              "
            >
`,
});

/* --- Para quem é o material: ilustração no topo dos 2 cards ---------------- */

const cardsParaQuem = [
  {
    img: "card-1-reta-final.jpg",
    alt: "Ampulheta com areia quase toda escoada, ao lado de um capelo de formatura e um estetoscópio",
  },
  {
    img: "card-2-visual.jpg",
    alt: "Cérebro anatômico com linhas e nós geométricos saindo dele de forma organizada, com um marca-texto em frente",
  },
];

poeImagemNosCards({
  secao: PARA_QUEM,
  nome: "Para quem é o material",
  pasta: "para-quem",
  imagens: cardsParaQuem,
  padding: "22px 26px 26px",
  estiloAntigo: `              style="
                padding: 26px;
                border-radius: 18px;
                background: #fff;
                border: 1px solid rgba(11, 43, 38, 0.1);
                box-shadow:
                  0 1px 2px rgba(11, 43, 38, 0.04),
                  0 18px 40px -28px rgba(11, 43, 38, 0.24);
              "
            >
`,
  estiloNovo: `              style="
                border-radius: 18px;
                overflow: hidden;
                background: #fff;
                border: 1px solid rgba(11, 43, 38, 0.1);
                box-shadow:
                  0 1px 2px rgba(11, 43, 38, 0.04),
                  0 18px 40px -28px rgba(11, 43, 38, 0.24);
              "
            >
`,
});

/* --- Calendário: os dois cards da comparação ------------------------------- */
// Aqui os cards têm estilos diferentes (caixa cinza x caixa branca com borda
// teal), então é uma chamada para cada.

poeImagemNosCards({
  secao: CALENDARIO,
  nome: "Calendário — o que sobrou de opção",
  pasta: "calendario",
  padding: "22px 26px 26px",
  imagens: [
    {
      img: "card-1-sem-tempo.jpg",
      alt: "Pilha alta de livros e fichários grossos em tons de cinza, diante de um calendário de parede em branco",
    },
  ],
  estiloAntigo: `              style="
                padding: 26px;
                border-radius: 18px;
                background: #eceeed;
                border: 1px solid rgba(11, 43, 38, 0.09);
              "
            >
`,
  estiloNovo: `              style="
                border-radius: 18px;
                overflow: hidden;
                background: #eceeed;
                border: 1px solid rgba(11, 43, 38, 0.09);
              "
            >
`,
});

poeImagemNosCards({
  secao: CALENDARIO,
  nome: "Calendário — com os 120 mapas",
  pasta: "calendario",
  padding: "22px 26px 26px",
  imagens: [
    {
      img: "card-2-mapas.jpg",
      alt: "Apostila espiralada aberta, com as duas páginas organizadas em blocos limpos",
    },
  ],
  estiloAntigo: `              style="
                padding: 26px;
                border-radius: 18px;
                background: #fff;
                border: 1px solid rgba(17, 109, 115, 0.28);
                box-shadow:
                  0 1px 2px rgba(11, 43, 38, 0.04),
                  0 18px 40px -28px rgba(11, 43, 38, 0.24);
              "
            >
`,
  estiloNovo: `              style="
                border-radius: 18px;
                overflow: hidden;
                background: #fff;
                border: 1px solid rgba(17, 109, 115, 0.28);
                box-shadow:
                  0 1px 2px rgba(11, 43, 38, 0.04),
                  0 18px 40px -28px rgba(11, 43, 38, 0.24);
              "
            >
`,
});

// CSS compartilhado por todas as seções que ganharam ilustração
secoes[OQUE_CAI].html = secoes[OQUE_CAI].html.replace(
  "      <section",
  `      <style>
        .card-img {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          background: #eef2ef;
        }
      </style>
      <section`,
);

/* --- Galeria do material impresso, rodando na sanfona ---------------------- */

// Fotos reais do material, recortadas em 720x720 por comprime-depoimentos.ps1.
// Só foto: sem nome, sem estrela, sem frase atribuída a ninguém.
// A ordem alterna capa fechada e mapa aberto pra não empilhar cena parecida.
const fotosMaterial = [
  {
    foto: "dep-1-carro.jpg",
    alt: "Três apostilas dos mapas clínicos — Cardiologia, Neurologia e Pneumologia — no banco do carro",
  },
  {
    foto: "dep-7-diabetes.jpg",
    alt: "Mapa de Diabetes Mellitus aberto na mesa, com o PDF de Pneumologia aberto no notebook ao fundo",
  },
  {
    foto: "dep-4-mesa-cardio.jpg",
    alt: "Apostila de Cardiologia na mesa de estudos, ao lado de caderno e notebook",
  },
  {
    foto: "dep-8-derrame-sofa.jpg",
    alt: "Mapa de Derrame Pleural aberto sobre o sofá, ao lado de um caderno de anotações",
  },
  {
    foto: "dep-3-mesa-dpoc.jpg",
    alt: "Mapa de DPOC aberto na mesa, ao lado da capa de Pneumologia e do caderno",
  },
  {
    foto: "dep-2-asma-cama.jpg",
    alt: "Mapa de Asma aberto, mostrando classificação, sinais, exames e dica de prova em uma página",
  },
  {
    foto: "dep-5-cama-cardio.jpg",
    alt: "Apostila de Cardiologia sobre a cama, ao lado de um tablet com anotações",
  },
  {
    foto: "dep-6-sca-mesa.jpg",
    alt: "Mapa de Síndrome Coronariana Aguda aberto sobre a mesa, ao lado de um caderno com anotações à mão",
  },
];

const cardFoto = (d, clone) => `
            <figure class="dep-card"${clone ? ' aria-hidden="true"' : ""}>
              <img
                class="dep-foto"
                src="assets/img/depoimentos/${d.foto}"
                alt="${clone ? "" : d.alt}"
                width="720"
                height="720"
                loading="lazy"
                decoding="async"
              />
            </figure>`;

// O marquee usa track.scrollWidth / 2, então a lista tem que aparecer 2x.
const marqueeDepoimentos = `        <!-- [B] Galeria do material impresso -->
        <style>
          .dep-card {
            /* 80vw deixa a próxima aparecendo de canto: dá a dica de que rola */
            width: min(80vw, 300px);
            flex: 0 0 auto;
            margin: 0;
            border-radius: 20px;
            overflow: hidden;
            background: #fff;
            border: 1px solid rgba(11, 43, 38, 0.1);
            box-shadow:
              0 1px 2px rgba(11, 43, 38, 0.04),
              0 20px 44px -28px rgba(11, 43, 38, 0.24);
          }
          .dep-foto {
            display: block;
            width: 100%;
            height: auto;
            /* as fotos já saem quadradas do script, então não há corte aqui */
            aspect-ratio: 1 / 1;
            object-fit: cover;
            background: #e8efea;
          }
          .prova-social {
            margin: 20px auto 0;
            width: fit-content;
            max-width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 4px 10px;
            padding: 10px 20px;
            border-radius: 999px;
            background: #fff;
            border: 1px solid rgba(11, 43, 38, 0.09);
            box-shadow: 0 1px 2px rgba(11, 43, 38, 0.04);
          }
          .prova-estrelas {
            flex: 0 0 auto;
            color: #8a6a12;
            font-size: 13px;
            line-height: 1;
            letter-spacing: 2px;
            /* o letter-spacing sobra depois da última estrela e abre um vão
               falso antes do texto; isso puxa de volta */
            margin-right: -2px;
          }
          .prova-texto {
            font-size: 13.5px;
            line-height: 1.4;
            color: #4e5e5f;
          }
          .prova-texto b {
            color: #093235;
          }
          /* No celular o selo não cabe em 13,5px e quebra em duas linhas,
             deixando as estrelas soltas. Encolhe um pouco pra caber inteiro. */
          @media (max-width: 430px) {
            .prova-social {
              gap: 4px 7px;
              padding: 9px 10px;
            }
            .prova-estrelas {
              font-size: 10.5px;
              letter-spacing: 1px;
              margin-right: -1px;
            }
            .prova-texto {
              font-size: 11.5px;
            }
          }
          /* 360px (Galaxy e afins) é largura comum demais pra deixar quebrar */
          @media (max-width: 370px) {
            .prova-social {
              padding: 9px 10px;
            }
            .prova-estrelas {
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .prova-texto {
              font-size: 11px;
            }
          }
          @media (min-width: 900px) {
            .dep-card {
              width: 300px;
            }
          }
        </style>
        <div
          style="margin-top: clamp(32px, 4vw, 48px)"
          class="marquee-container"
          data-speed="0.55"
          data-direction="1"
        >
          <div class="marquee-track">${fotosMaterial.map((d) => cardFoto(d, false)).join("")}
            <!-- Clones -->${fotosMaterial.map((d) => cardFoto(d, true)).join("")}
          </div>
        </div>

        <!-- [B] Correção do card em branco.
             O lazy nativo só carrega a foto quando ela entra na tela. Numa
             sanfona horizontal isso acontece com o card já deslizando pra
             dentro: o cara vê o card branco e a imagem aparece do nada.
             Aqui as fotos seguem lazy até a seção chegar perto da tela; nesse
             momento TODAS viram eager de uma vez, então quando a sanfona
             começa a girar já está tudo em cache. Se o JS falhar, o lazy
             nativo continua valendo — volta o pop, mas nada quebra. -->
        <script>
          (function () {
            var secao = document.currentScript.parentNode;
            var fotos = secao.querySelectorAll(".dep-foto");
            if (!fotos.length) return;
            var feito = false;

            function carregarTodas() {
              if (feito) return;
              feito = true;
              for (var i = 0; i < fotos.length; i++) fotos[i].loading = "eager";
              window.removeEventListener("scroll", verificar);
              window.removeEventListener("resize", verificar);
            }

            function verificar() {
              // 800px de antecedência: dá tempo de baixar antes de aparecer
              if (secao.getBoundingClientRect().top < window.innerHeight + 800) {
                carregarTodas();
              }
            }

            window.addEventListener("scroll", verificar, { passive: true });
            window.addEventListener("resize", verificar, { passive: true });
            verificar();
          })();
        </script>
`;

secoes[DEPOIMENTOS].html =
  secoes[DEPOIMENTOS].html.slice(
    0,
    secoes[DEPOIMENTOS].html.indexOf("        <!-- Testimonials Marquee -->"),
  ) +
  marqueeDepoimentos +
  "      </section>";

if (secoes[DEPOIMENTOS].html.includes("Testimonials Marquee")) {
  throw new Error("O marquee antigo de depoimentos não foi substituído");
}

// Tira o parágrafo de subtítulo que vem logo abaixo do título da seção.
// Confere um trecho esperado antes de remover, pra nunca apagar o bloco errado.
const tiraSubtitulo = (indice, tagTitulo, trechoEsperado) => {
  const html = secoes[indice].html;
  const fim = html.indexOf("</" + tagTitulo + ">");
  if (fim < 0) throw new Error("Sem <" + tagTitulo + "> em: " + trechoEsperado);

  const ini = html.indexOf("<p", fim);
  const fimP = html.indexOf("</p>", ini);
  if (ini < 0 || fimP < 0)
    throw new Error("Sem <p> após o título em: " + trechoEsperado);

  const paragrafo = html.slice(ini, fimP + 4);
  if (!paragrafo.includes(trechoEsperado)) {
    throw new Error(
      "Parágrafo inesperado. Esperava '" +
        trechoEsperado +
        "', achei: " +
        paragrafo.replace(/\s+/g, " ").slice(0, 120),
    );
  }

  // Come também a indentação da linha do <p>, pra não deixar linha vazia
  let corte = ini;
  while (corte > 0 && " \t".includes(html[corte - 1])) corte--;
  if (html[corte - 1] === "\n") corte--;

  secoes[indice].html = html.slice(0, corte) + html.slice(fimP + 4);
};

tiraSubtitulo(AMOSTRAS, "h2", "Fluxogramas diagnósticos");
tiraSubtitulo(OQUE_CAI, "h2", "raciocínio diagnóstico e terapêutico");
tiraSubtitulo(DEPOIMENTOS, "h2", "Veja o que dizem estudantes");
tiraSubtitulo(PARA_QUEM, "h2", "Você não precisa estudar tudo novamente");
tiraSubtitulo(RETA_FINAL, "h3", "O acesso chega em minutos");
tiraSubtitulo(MODULOS, "h2", "6 grandes áreas clínicas");
tiraSubtitulo(BONUS, "h2", "Materiais complementares");

// A seção não tem mais depoimento nenhum, só foto do material — o selo de
// "Depoimentos" ficaria prometendo o que não está ali embaixo.
secoes[DEPOIMENTOS].html = trocaUnica(
  secoes[DEPOIMENTOS].html,
  '<span class="section-tag">Depoimentos</span>',
  '<span class="section-tag">Na prática</span>',
  "selo da seção de depoimentos",
);

// O selo entra depois, no lugar do subtítulo que acabou de sair
secoes[DEPOIMENTOS].html = trocaUnica(
  secoes[DEPOIMENTOS].html,
  "            Quem revisa com os mapas chega diferente na prova\n          </h2>",
  "            Quem revisa com os mapas chega diferente na prova\n          </h2>" +
    seloProvaSocial,
  "título dos depoimentos",
);

// Destaca o "Acesso vitalício" que já existia enterrado no último bullet
secoes[PLANOS].html = trocaUnica(
  secoes[PLANOS].html,
  "><span>Acesso vitalício</span>",
  "><span><b>Acesso vitalício</b></span>",
  "bullet do plano básico",
);

/* --- Fase 3b: montar o documento ------------------------------------------- */

const pedacos = [cabecalho];

for (const n of novaOrdem) {
  pedacos.push(secoes[n].html);
  if (secoes[n].cola.trim()) pedacos.push(secoes[n].cola);
}

// CTA final, depois do FAQ — o ponto de fuga medido no mapa de calor
pedacos.push(
  ctaBloco(
    "Tirou a dúvida? Faltam poucos dias.",
    "Os 120 mapas ficam com você para sempre. Comece a revisar ainda hoje.",
    "Escolher meu plano",
  ),
);

pedacos.push(rodape);

let saida = pedacos.join("\n");

// Barra fixa antes do fim do body
// Barra de topo: fica só o contador. O "comece a revisar hoje de forma rápida
// e visual" repetia o H1, o subtítulo e a página inteira logo abaixo.
saida = trocaUnica(
  saida,
  `<span class="gold-highlight" data-countdown="curto">reta final</span> —
        comece a revisar hoje de forma rápida e visual!`,
  `<span class="gold-highlight" data-countdown="curto">reta final</span>`,
  "texto da barra de topo",
);

saida = trocaUnica(
  saida,
  "\n  </body>",
  cronometro + barraFixa + "\n  </body>",
  "</body>",
);

// Marca a variante no title
saida = trocaUnica(
  saida,
  "<title>",
  "<!-- VARIANTE B - percurso, dobra, CTAs e ordem das seções -->\n    <title>[B] ",
  "<title>",
);

fs.writeFileSync("index-b.html", usaCRLF ? saida.replace(/\n/g, "\r\n") : saida);

const nomes = {
  [HERO]: "hero",
  [AMOSTRAS]: "amostras",
  [OQUE_CAI]: "o que mais cai",
  [DEPOIMENTOS]: "depoimentos",
  [RETA_FINAL]: "reta final",
  [PARA_QUEM]: "para quem é",
  [CALENDARIO]: "calendário",
  [MODULOS]: "120 mapas",
  [BONUS]: "bônus",
  [PASSO]: "passo a passo",
  [PLANOS]: "planos",
  [GARANTIA]: "garantia",
  [FAQ]: "faq",
};

console.log("index-b.html gerado -", saida.length, "bytes");
console.log("ordem:", novaOrdem.map((n) => nomes[n]).join(" > "));
