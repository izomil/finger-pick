# Configuração de Imagens

## Como configurar as imagens

### 1. Estrutura dos Arquivos
Suas imagens devem seguir o padrão:
```
src/assets/images/
├── img1.jpg
├── img2.jpg
├── img3.jpg
└── ...
```

### 2. Arquivo de Configuração
Edite o arquivo `src/assets/images-config.json`:

```json
{
  "totalImages": 3,
  "basePath": "src/assets/images/",
  "filenamePattern": "img",
  "extension": "jpg",
  "startNumber": 1,
  "description": "Configuração das imagens do jogo Finger Pick"
}
```

### 3. Parâmetros de Configuração

- **totalImages**: Número total de imagens na pasta
- **basePath**: Caminho base das imagens
- **filenamePattern**: Padrão do nome do arquivo (ex: "img", "image", "foto")
- **extension**: Extensão dos arquivos (jpg, png, webp, etc.)
- **startNumber**: Número inicial (geralmente 1)

### 4. Exemplos de Configuração

#### Para imagens img1.jpg, img2.jpg, img3.jpg:
```json
{
  "totalImages": 3,
  "basePath": "src/assets/images/",
  "filenamePattern": "img",
  "extension": "jpg",
  "startNumber": 1
}
```

#### Para imagens image01.png, image02.png, image03.png:
```json
{
  "totalImages": 3,
  "basePath": "src/assets/images/",
  "filenamePattern": "image",
  "extension": "png",
  "startNumber": 1
}
```

#### Para imagens foto0.jpg, foto1.jpg, foto2.jpg:
```json
{
  "totalImages": 3,
  "basePath": "src/assets/images/",
  "filenamePattern": "foto",
  "extension": "jpg",
  "startNumber": 0
}
```

### 5. Como Adicionar Novas Imagens

1. Adicione a nova imagem na pasta `src/assets/images/`
2. Siga o padrão de nomenclatura (ex: img4.jpg)
3. Atualize o campo `totalImages` no arquivo de configuração

### 6. Como Funciona

- O sistema gera um número aleatório entre `startNumber` e `totalImages`
- Constrói o caminho da imagem usando o padrão configurado
- Testa se a imagem existe antes de exibi-la
- Se não encontrar, tenta diferentes caminhos base como fallback
