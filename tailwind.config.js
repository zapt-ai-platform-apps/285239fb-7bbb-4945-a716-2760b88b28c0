export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                reddit: {
                    orange: '#FF4500',
                    red: '#FF0000',
                    blue: '#0079D3',
                    lightgray: '#F6F7F8',
                    medgray: '#DAE0E6',
                    darkgray: '#1A1A1B',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};