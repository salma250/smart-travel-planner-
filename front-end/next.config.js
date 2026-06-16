/** Next.js config — proxy /api to backend to avoid CORS in development */
/** Place this file in the `front/` folder (Next app root).
 * It rewrites /api/* to the backend API configured via NEXT_PUBLIC_API_URL.
 */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};