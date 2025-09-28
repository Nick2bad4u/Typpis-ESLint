'use strict';

module.exports = (async () => {
    const eslintReact = await import('@eslint-react/eslint-plugin');
    return [
        {
            plugins: {
                '@eslint-react': eslintReact.default ?? eslintReact
            },
            rules: {
                '@eslint-react/react-x/no-html-link-for-pages': 'off'
            }
        }
    ];
})();
