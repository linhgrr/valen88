# 💕 Valentine Letter

Một ứng dụng web chúc mừng Valentine đặc biệt với thiết kế đẹp mắt và animation mượt mà.

## Tính năng

- 🎨 Thiết kế từ Figma với màu sắc tình yêu
- ❤️ Animation trái tim phóng to/thu nhỏ
- ✨ Hiệu ứng loading với text "Loading..."
- 📱 Responsive design cho mọi thiết bị
- 🚀 Tối ưu cho deploy trên Vercel

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Animation:** Framer Motion
- **Styling:** CSS Modules

## Cài đặt và Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Chạy production
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Deploy trên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Vercel sẽ tự động detect Next.js và deploy

Hoặc sử dụng Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Cấu trúc Project

```
valentine-letter/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout
│       ├── page.tsx        # Loading screen (Screen 1)
│       ├── globals.css     # Global styles
│       └── page.module.css # Page styles
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## License

MIT
