# ENAMED 2026 — 120 Mapas Clínicos Visuais

Site formatado, com todos os assets e imagens locais, pronto para execução em localhost.

---

## 🚀 Como Executar no Localhost

### Opção 1: Node.js (Recomendado)

Execute no terminal da pasta do projeto:
`ash
node server.js
`
ou
`ash
npm start
`
O servidor iniciará automaticamente e mostrará o link (ex: http://localhost:3001 ou http://localhost:3000).

---

### Opção 2: Python

Caso prefira usar Python:
`ash
python -m http.server 3000
`
Depois acesse http://localhost:3000 no seu navegador.

---

## 🛠️ O que foi feito

- ✅ **Formatação Completa**: Código HTML, CSS e JavaScript totalmente formatados e identados com Prettier.
- ✅ **Download e Organização de Assets**: Todas as imagens, banners, ícones e scripts foram salvos na pasta /assets/, permitindo funcionamento 100% autônomo e offline.
- ✅ **Servidor Local Nativo (server.js)**: Criado servidor HTTP em Node.js com detecção inteligente de porta livre (fallback automático caso a porta 3000 já esteja ocupada).
- ✅ **Scripts no package.json**: Comandos rápidos
  pm start e
  pm run format.
