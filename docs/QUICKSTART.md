# ⚡ Quick Start - Finger Pick

## 🚀 Começar em 30 segundos

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor local
```bash
npm start
```

### 3. Abrir no navegador
- Desktop: http://localhost:3000
- Mobile: http://SEU-IP:3000

## 📱 Testar PWA

1. **Acesse no mobile**
2. **Toque em "Adicionar à tela inicial"**
3. **Teste offline** (desligue WiFi)

## 🎮 Como Jogar

1. **Coloque dedos na tela** (cada pessoa = 1 dedo)
2. **Clique "Iniciar Jogo"**
3. **Aguarde a contagem**
4. **Veja quem ganhou!** 🎉

## 🔧 Configuração Supabase (Opcional)

Para imagens aleatórias ao final:

1. **Crie projeto no Supabase**
2. **Configure bucket `finais`**
3. **Edite `supabase-config.js`**:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://seu-projeto.supabase.co',
       anonKey: 'sua-chave',
       storageBucket: 'finais'
   };
   ```

## 🚀 Deploy

### Netlify (Mais fácil)
1. Arraste pasta para netlify.com
2. Pronto! 🎉

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
1. Push para GitHub
2. Ative Pages nas configurações
3. Pronto! 🎉

## 📁 Estrutura

```
finger-pick/
├── index.html          # Página principal
├── styles.css          # Estilos
├── game.js            # Lógica do jogo
├── supabase-config.js # Configuração Supabase
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── package.json       # Dependências
├── dev-server.js      # Servidor local
└── README.md          # Documentação completa
```

## 🎯 Funcionalidades

- ✅ **PWA** - Instala como app
- ✅ **Offline** - Funciona sem internet
- ✅ **Responsivo** - Qualquer tela
- ✅ **Touch** - Múltiplos dedos
- ✅ **Animações** - Efeitos visuais
- ✅ **Imagens** - Supabase Storage
- ✅ **Haptic** - Vibração

## 🐛 Problemas?

### PWA não instala
- Verifique HTTPS
- Confira manifest.json
- Teste Service Worker

### Não funciona offline
- Verifique sw.js
- Confira cache
- Teste DevTools

### Imagens não carregam
- Configure Supabase
- Verifique bucket público
- Confira URLs

## 📞 Suporte

- 📖 **Documentação**: README.md
- 🚀 **Deploy**: DEPLOY.md
- 🎮 **Jogo**: Divirta-se!

---

**Pronto para jogar! 🎮✨**

