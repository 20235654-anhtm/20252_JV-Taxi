# Sử dụng Node.js Alpine image làm base
FROM node:22-alpine

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép các tệp package.json và package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm cả devDependencies để build TS)
RUN npm ci

# Sao chép mã nguồn
COPY . .

# Generate Prisma client và biên dịch TypeScript sang JS (dist/)
RUN npm run build

# Xóa bớt các devDependencies không cần thiết trong môi trường production để giảm dung lượng image
RUN npm prune --production

# Expose port
EXPOSE 5000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]
