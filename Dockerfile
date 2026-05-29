# Sử dụng Node.js 20 làm base image
FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy các file cấu hình package
COPY package*.json ./

# Cài đặt toàn bộ thư viện (kể cả devDependencies để build)
RUN npm install

# Copy toàn bộ mã nguồn vào
COPY . .

# Build ứng dụng Frontend (Vite) và Backend (esbuild) ra thư mục dist/
RUN npm run build

# Xóa các file dev không cần thiết (tùy chọn để làm nhẹ container)
# RUN npm prune --production

# Mở cổng 3000
EXPOSE 3000

# Lệnh khởi động server
CMD ["npm", "run", "start"]
