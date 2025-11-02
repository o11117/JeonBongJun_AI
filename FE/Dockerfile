# Dockerfile (in src/ folder)

# 1. Build stage: Node.js 환경에서 React 앱 빌드
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# 환경 변수 설정 (예: 백엔드 API 주소)
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 2. Production stage: Nginx 서버에 빌드 결과물 복사
FROM nginx:1.25-alpine
# Nginx 기본 설정 파일 삭제
RUN rm /etc/nginx/conf.d/default.conf
# 직접 작성한 Nginx 설정 파일 복사 (아래 'nginx.conf' 참고)
COPY src/nginx.conf /etc/nginx/conf.d/
# 빌드된 React 앱 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]