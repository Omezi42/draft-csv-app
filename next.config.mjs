// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // SWC を使った最適化ビルドを有効化（Next.js 12+ ならデフォルトですが念のため）
    swcMinify: true,
  
    // 開発サーバーのファイルウォッチ設定をカスタマイズ
    webpackDevMiddleware: (config) => {
      config.watchOptions = {
        // node_modules や .git 配下は監視しない
        ignored: ['**/node_modules/**', '**/.git/**'],
        // ファイル変更から再ビルドまでの猶予（ミリ秒）
        aggregateTimeout: 300,
        // ポーリング間隔（ミリ秒）※特に WSL や VM 環境で有効
        poll: 1000,
      };
      return config;
    },
  };
  
  export default nextConfig;
  