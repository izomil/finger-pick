# 🎮 Finger Pick

Um jogo simples para celular (PWA/Android/iOS) onde cada jogador coloca um dedo na tela. O app desenha círculos coloridos em volta de cada dedo, inicia uma contagem regressiva e, ao final, um dedo é escolhido aleatoriamente como vencedor.

## ✨ Características

- 🎯 **Sem anúncios** - Jogo completamente gratuito
- 📱 **PWA** - Funciona como app nativo no mobile
- 🌐 **Offline-first** - Funciona sem internet
- 🎨 **Design responsivo** - Adapta-se a qualquer tela
- 🎊 **Imagens aleatórias** - Integração com Supabase Storage
- ⚡ **Rápido e leve** - Carregamento instantâneo

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Acessar no navegador
# Desktop: http://localhost:3000
# Mobile: http://SEU-IP:3000
```

## 📁 Estrutura do Projeto

```
finger-pick/
├── src/                    # Código fonte
│   ├── js/                  # JavaScript
│   │   ├── game.js         # Lógica do jogo
│   │   └── supabase-config.js # Configuração Supabase
│   ├── css/                 # Estilos
│   │   └── styles.css      # CSS principal
│   └── assets/             # Recursos
│       ├── icons/          # Ícones PWA
│       └── images/         # Imagens
├── public/                 # Arquivos públicos
│   ├── sw.js              # Service Worker
│   └── manifest.json      # PWA Manifest
├── config/                # Configurações
│   ├── project.config.js  # Configuração do projeto
│   ├── dev-server.config.js # Configuração do servidor
│   ├── netlify.toml       # Deploy Netlify
│   └── vercel.json        # Deploy Vercel
├── docs/                  # Documentação
│   ├── README.md          # Documentação completa
│   ├── DEPLOY.md          # Guia de deploy
│   └── QUICKSTART.md      # Início rápido
├── index.html             # Página principal
├── dev-server.js          # Servidor de desenvolvimento
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## 🎮 Como Jogar

1. **Coloque dedos na tela** - Cada pessoa = 1 dedo
2. **Com 2+ dedos** - Contagem inicia automaticamente
3. **Aguarde a contagem** - Regressiva configurável
4. **Veja quem ganhou!** - Dedo vencedor destacado
5. **Remova o vencedor** - Imagem aleatória aparece

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Servidor de desenvolvimento
npm run dev        # Live server com hot reload
npm run serve      # Servidor estático
npm run build      # Build (não necessário para PWA)
npm run deploy     # Deploy (instruções)
```

### Configuração

- **Configuração do projeto**: `config/project.config.js`
- **Configuração do servidor**: `config/dev-server.config.js`
- **Configuração Supabase**: `src/js/supabase-config.js`

## 🚀 Deploy

### Netlify (Recomendado)
1. Arraste a pasta para netlify.com
2. Pronto! 🎉

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
1. Push para GitHub
2. Ative Pages nas configurações
3. Pronto! 🎉

## 📱 PWA

O jogo é um Progressive Web App completo:

- ✅ **Manifest.json** - Configuração do app
- ✅ **Service Worker** - Funcionamento offline
- ✅ **Ícones** - Suporte a diferentes tamanhos
- ✅ **Instalação** - "Adicionar à tela inicial"

## 🔧 Configuração Supabase (Opcional)

Para usar imagens aleatórias:

1. **Crie projeto no Supabase**
2. **Configure Storage**:
   - Crie bucket `finais`
   - Torne público
   - Faça upload de imagens
3. **Atualize configuração**:
   ```javascript
   // Em config/project.config.js
   supabase: {
       enabled: true,
       url: 'https://seu-projeto.supabase.co',
       anonKey: 'sua-chave-anonima',
       storageBucket: 'finais'
   }
   ```

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
