/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
        colors: {
            pesiraGreen: '#22E07A',
            pesiraBlack: '#000000',
            pesiraWhite: '#FFFFFF',
            pesiraEmerald: '#10B981',
            pesiraGray: '#111827',
            pesiraGreen200: '#BBF7D0',
            pesiraEmarald50: '#ECFDF5',
            pesiraGray400: '#9CA3AF',
            pesiraGray500: '#6B7280',
            pesiraGray200: '#E5E7EB',
        }
    },
  },
  plugins: [],
};
