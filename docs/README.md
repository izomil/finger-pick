# 🎮 Finger Pick

Um jogo simples para celular (PWA/Android/iOS) onde cada jogador coloca um dedo na tela. O app desenha círculos coloridos em volta de cada dedo, inicia uma contagem regressiva e, ao final, um dedo é escolhido aleatoriamente como vencedor.

## ✨ Características

- 🎯 **Sem anúncios** - Jogo completamente gratuito
- 📱 **PWA** - Funciona como app nativo no mobile
- 🌐 **Offline-first** - Funciona sem internet
- 🎨 **Design responsivo** - Adapta-se a qualquer tela
- 🎊 **Imagens aleatórias** - Integração com Supabase Storage
- ⚡ **Rápido e leve** - Carregamento instantâneo

## 🚀 Como usar

1. **Acesse o jogo** no seu navegador mobile
2. **Coloque os dedos** na tela (cada pessoa = 1 dedo)
3. **Clique em "Iniciar Jogo"**
4. **Aguarde a contagem** regressiva
5. **Veja quem ganhou!** 🎉

## 🛠️ Instalação

### Opção 1: PWA (Recomendado)
1. Acesse o jogo no navegador mobile
2. Toque em "Adicionar à tela inicial" quando aparecer
3. O ícone será criado na sua tela inicial

### Opção 2: Servidor local
```bash
# Clone o repositório
git clone <seu-repositorio>
cd finger-pick

# Inicie um servidor local (qualquer um funciona)
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Opção 3: Deploy
- **Netlify**: Arraste a pasta para netlify.com
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Ative nas configurações do repositório
- **Firebase Hosting**: `firebase deploy`

## 🔧 Configuração do Supabase (Opcional)

Para usar imagens aleatórias ao final do jogo:

1. **Crie um projeto no Supabase**
2. **Configure o Storage**:
   - Crie um bucket chamado `finais`
   - Torne-o público
   - Faça upload de imagens na pasta `finais/`

3. **Atualize a configuração**:
```javascript
// Em supabase-config.js
const SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',
    anonKey: 'sua-chave-anonima',
    storageBucket: 'finais'
};
```

4. **Inclua a biblioteca Supabase**:
```html
<!-- Adicione antes do supabase-config.js -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 📱 Funcionalidades

### Básicas
- ✅ Detecção de múltiplos toques
- ✅ Círculos coloridos para cada dedo
- ✅ Contagem regressiva configurável (3s, 5s, 10s)
- ✅ Sorteio aleatório do vencedor
- ✅ Efeitos visuais e animações
- ✅ Feedback háptico (vibração)
- ✅ Design responsivo

### Avançadas
- ✅ PWA com Service Worker
- ✅ Funciona offline
- ✅ Cache inteligente
- ✅ Imagens aleatórias do Supabase
- ✅ Instalação como app nativo
- ✅ Suporte a atalhos

## 🎨 Personalização

### Cores dos dedos
Edite o array `colors` em `game.js`:
```javascript
this.colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', // suas cores aqui
];
```

### Tempo de contagem
Adicione opções em `index.html`:
```html
<option value="15">15 segundos</option>
```

### Imagens personalizadas
Substitua as imagens SVG em `supabase-config.js` ou adicione suas próprias no Supabase Storage.

## 🔧 Desenvolvimento

### Estrutura do projeto
```
finger-pick/
├── index.html          # Página principal
├── styles.css          # Estilos
├── game.js            # Lógica do jogo
├── supabase-config.js # Configuração Supabase
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── icons/             # Ícones PWA
└── README.md          # Este arquivo
```

### Tecnologias
- **HTML5 Canvas** - Desenho dos círculos
- **JavaScript ES6+** - Lógica do jogo
- **CSS3** - Estilos e animações
- **Service Worker** - Cache offline
- **Supabase** - Storage de imagens
- **PWA** - App-like experience

## 🚀 Funcionalidades futuras

- [ ] Sons e música de fundo
- [ ] Estatísticas de vitórias
- [ ] Temas personalizáveis
- [ ] Modo multiplayer online
- [ ] Mais tipos de animações
- [ ] Configurações avançadas

## 📄 Licença

MIT License - Use livremente para projetos pessoais e comerciais.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests
- Adicionar novas funcionalidades

---

**Divirta-se jogando! 🎮✨**

